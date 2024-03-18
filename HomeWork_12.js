import pg from 'pg'
import fs from 'fs'

const { Client } = pg

const client = new Client({
    host: 'surus.db.elephantsql.com',
    port: 5432,
    database: 'ddistqnh',
    user: 'ddistqnh',
    password: 'Dr6XKrrqzwxkvLbi9StkUn54Aez_9MB_',
});

async function createTables() {
    try {
        await client.connect()

        await client.query(`
            CREATE TABLE IF NOT EXISTS days_of_week (
                id SERIAL PRIMARY KEY,
                day_of_week VARCHAR(20) NOT NULL
            )
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS lesson_hours (
                id SERIAL PRIMARY KEY,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL
            )
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id SERIAL PRIMARY KEY,
                subject_name VARCHAR(100) NOT NULL
            )
        `)

        console.log(">> Tables created successfully.")

    } catch (error) {
        console.error(">> Error creating tables:", error)
    }
}

async function importData(filePath, tableName) {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
        const jsonData = JSON.parse(data)

        for (const item of jsonData) {
            const columns = Object.keys(item).join(', ')
            const values = Object.values(item).map(val => "'" + val + "'").join(', ')

            await client.query(`
                INSERT INTO ${tableName} (${columns})
                VALUES (${values})
            `)
        }
        console.log(`>> Data imported into '${tableName}' table successfully.`)

    } catch (error) {
        console.error(">> Error importing data:", error)
    }
}


async function displayData(tableName) {
    try {
        const result = await client.query(`SELECT * FROM ${tableName}`)
        console.log(`>> Data from '${tableName}' table:`)
        console.log(result.rows)

    } catch (error) {
        console.error(">> Error displaying data:", error)
    }
}

async function main() {
    await createTables()
    const tables = ['days_of_week', 'lesson_hours', 'subjects']

    for (const table of tables) {
        const hasDataInTable = await hasData(table)

        switch (true) {
            case hasDataInTable:
                console.log(`>> Data already exists in '${table}' table:`)
                await displayData(table)
                break
            default:
                await importData(`./data/${table}.json`, table)
                break
        }
    }
    await client.end()
}

async function hasData(tableName) {
    try {
        const result = await client.query(`SELECT EXISTS (SELECT 1 FROM ${tableName})`)
        return result.rows[0].exists
    } catch (error) {
        console.error(">> Error checking data:", error)
        return false
    }
}

main()