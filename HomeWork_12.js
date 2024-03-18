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

async function clearTable(tableName) {
    try {
        await client.query(`DELETE FROM ${tableName}`)
        console.log(`>> Data cleared from '${tableName}' table successfully.`)
    } catch (error) {
        console.error(">> Error clearing data from table:", error)
    }
}

async function resetSequence(tableName) {
    try {
        await client.query(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`)
        console.log(`>> Sequence reset for '${tableName}' table successfully.`)
    } catch (error) {
        console.error(">> Error resetting sequence:", error)
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

    await clearTable('days_of_week')
    await clearTable('lesson_hours')
    await clearTable('subjects')

    await resetSequence('days_of_week')
    await resetSequence('lesson_hours')
    await resetSequence('subjects')

    await importData('./data/days_of_week.json', 'days_of_week')
    await importData('./data/lesson_hours.json', 'lesson_hours')
    await importData('./data/subjects.json', 'subjects')

    await displayData('days_of_week')
    await displayData('lesson_hours')
    await displayData('subjects')

    await client.end()
}

main()