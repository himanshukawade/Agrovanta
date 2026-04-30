import asyncio
import asyncpg

async def init_db():
    print("Connecting to default postgres database to create target DB...")
    
    # 1. Connect to the default 'postgres' database
    conn = await asyncpg.connect('postgresql://postgres:Admin@localhost:5432/postgres')
    
    try:
        # Terminate existing connections to allow drop
        await conn.execute('''
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'livestock_monitoring_db'
              AND pid <> pg_backend_pid();
        ''')
        print("Terminated existing connections.")
    except Exception as e:
        print(f"Failed to terminate connections: {e}")

    try:
        # Drop and create
        await conn.execute('DROP DATABASE IF EXISTS livestock_monitoring_db')
        await conn.execute('CREATE DATABASE livestock_monitoring_db')
        print("Dropped and created livestock_monitoring_db.")
    except asyncpg.exceptions.ActiveSqlTransactionError:
        print("Could not drop/create inside transaction.")
    finally:
        await conn.close()

    # 2. Connect to the new database and execute setup.sql
    print("Connecting to livestock_monitoring_db to run setup.sql...")
    conn = await asyncpg.connect('postgresql://postgres:Admin@localhost:5432/livestock_monitoring_db')
    
    try:
        with open('database/setup.sql', 'r', encoding='utf-8') as f:
            setup_sql = f.read()
        
        await conn.execute(setup_sql)
        print("Successfully executed setup.sql!")
    except Exception as e:
        print(f"Error executing setup.sql: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(init_db())
