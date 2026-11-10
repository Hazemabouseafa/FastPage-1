<?php

namespace App\Console\Commands;

use App\Services\PersistentCustomerDataService;
use Illuminate\Console\Command;

class SyncCustomerDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'saas:sync-customers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize all customer and restaurant data to Persistent Storage (JSON & CSV)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting customer data synchronization to Persistent Storage...');

        $result = PersistentCustomerDataService::sync();

        $this->info("✓ Successfully synced {$result['total_customers']} customer(s).");
        $this->line("• JSON file: {$result['json_file']} (" . round($result['json_size'] / 1024, 2) . ' KB)');
        $this->line("• CSV file:  {$result['csv_file']} (" . round($result['csv_size'] / 1024, 2) . ' KB)');

        return Command::SUCCESS;
    }
}
