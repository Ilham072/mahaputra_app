<?php

namespace Tests\Feature;

use App\Actions\CreateOperationalExpenseAction;
use App\Enums\UserRole;
use App\Models\ExpenseCategory;
use App\Models\OperationalExpense;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OperationalExpenseTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_operational_expenses_page(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $category = ExpenseCategory::query()->create(['name' => 'Listrik']);

        OperationalExpense::query()->create([
            'category_id' => $category->id,
            'transaction_date' => '2026-08-08',
            'amount' => 500000,
            'description' => 'Token listrik',
            'proof_file_path' => 'operational-expenses/proofs/listrik.pdf',
            'proof_original_name' => 'listrik.pdf',
            'proof_mime_type' => 'application/pdf',
        ]);

        $this->actingAs($admin)
            ->get(route('operations.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Operations/Index')
                ->has('expenses.data', 1)
                ->where('summary.month_total', 500000)
                ->where('summary.filtered_total', 500000)
            );
    }

    public function test_admin_can_create_operational_expense_with_private_proof(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $category = ExpenseCategory::query()->create(['name' => 'Listrik']);

        $this->actingAs($admin)
            ->post(route('operations.store'), [
                'category_id' => $category->id,
                'transaction_date' => '2026-08-08',
                'amount' => 500000,
                'description' => 'Token listrik',
                'proof' => UploadedFile::fake()->create('listrik.pdf', 100, 'application/pdf'),
            ])
            ->assertRedirect(route('operations.index'));

        $expense = OperationalExpense::query()->firstOrFail();

        $this->assertDatabaseHas('operational_expenses', [
            'category_id' => $category->id,
            'amount' => 500000,
            'description' => 'Token listrik',
            'proof_original_name' => 'listrik.pdf',
        ]);
        $this->assertSame('2026-08-08', $expense->transaction_date->toDateString());

        Storage::disk('local')->assertExists($expense->proof_file_path);
        Storage::disk('public')->assertMissing($expense->proof_file_path);
    }

    public function test_owner_can_view_but_cannot_create_operational_expense(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $category = ExpenseCategory::query()->create(['name' => 'Listrik']);

        $this->actingAs($owner)
            ->get(route('operations.index'))
            ->assertOk();

        $this->actingAs($owner)
            ->post(route('operations.store'), [
                'category_id' => $category->id,
                'transaction_date' => '2026-08-08',
                'amount' => 500000,
                'proof' => UploadedFile::fake()->create('listrik.pdf', 100, 'application/pdf'),
            ])
            ->assertForbidden();
    }

    public function test_operational_expense_validates_amount_and_proof_type(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $category = ExpenseCategory::query()->create(['name' => 'Listrik']);

        $this->actingAs($admin)
            ->from(route('operations.index'))
            ->post(route('operations.store'), [
                'category_id' => $category->id,
                'transaction_date' => '2026-08-08',
                'amount' => -1,
                'proof' => UploadedFile::fake()->create('proof.exe', 10, 'application/octet-stream'),
            ])
            ->assertRedirect(route('operations.index'))
            ->assertSessionHasErrors(['amount', 'proof']);
    }

    public function test_authenticated_users_can_download_private_operational_proof(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $category = ExpenseCategory::query()->create(['name' => 'Listrik']);
        $path = 'operational-expenses/proofs/listrik.pdf';
        Storage::disk('local')->put($path, 'proof');

        $expense = OperationalExpense::query()->create([
            'category_id' => $category->id,
            'transaction_date' => '2026-08-08',
            'amount' => 500000,
            'proof_file_path' => $path,
            'proof_original_name' => 'listrik.pdf',
            'proof_mime_type' => 'application/pdf',
        ]);

        $this->get(route('operations.proof.download', $expense))
            ->assertRedirect('/login');

        $this->actingAs($owner)
            ->get(route('operations.proof.download', $expense))
            ->assertOk();
    }

    public function test_operational_expenses_can_be_filtered_by_category(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $listrik = ExpenseCategory::query()->create(['name' => 'Listrik']);
        $internet = ExpenseCategory::query()->create(['name' => 'Internet']);

        OperationalExpense::query()->create([
            'category_id' => $listrik->id,
            'transaction_date' => '2026-08-08',
            'amount' => 500000,
            'proof_file_path' => 'operational-expenses/proofs/listrik.pdf',
        ]);
        OperationalExpense::query()->create([
            'category_id' => $internet->id,
            'transaction_date' => '2026-08-08',
            'amount' => 300000,
            'proof_file_path' => 'operational-expenses/proofs/internet.pdf',
        ]);

        $this->actingAs($admin)
            ->get(route('operations.index', ['category_id' => $listrik->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('expenses.data', 1)
                ->where('summary.filtered_total', 500000)
            );
    }

    public function test_operational_proof_file_is_removed_when_database_write_fails(): void
    {
        Storage::fake('local');

        try {
            app(CreateOperationalExpenseAction::class)->execute([
                'category_id' => 999,
                'transaction_date' => '2026-08-08',
                'amount' => 500000,
                'description' => 'Invalid category',
                'proof' => UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf'),
            ]);
        } catch (QueryException) {
            $this->assertSame([], Storage::disk('local')->allFiles('operational-expenses/proofs'));

            return;
        }

        $this->fail('Expected database write to fail.');
    }
}
