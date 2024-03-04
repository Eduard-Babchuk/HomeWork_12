import pg from 'pg'
const { Client } = pg

const client = new Client({
    host: 'surus.db.elephantsql.com',
    port: 5432,
    database: 'ddistqnh',
    user: 'ddistqnh',
    password: 'Dr6XKrrqzwxkvLbi9StkUn54Aez_9MB_',
})

async function createTables() {
    try {
        await client.connect()

        await client.query(`
            CREATE TABLE IF NOT EXISTS weekly_schedule (
                id SERIAL PRIMARY KEY,
                day_of_week VARCHAR(20) NOT NULL,
                time_start TIME NOT NULL,
                time_end TIME NOT NULL,
                subject VARCHAR(100) NOT NULL,
                group_id INT
            )
        `)

        console.log(">> Table 'weekly_schedule' created successfully.")

    } catch (error) {
        console.error(">> Error creating table:", error)
    }
}

async function clearTable() {
    try {
        await client.query(`TRUNCATE TABLE weekly_schedule`)
        console.log(">> Table 'weekly_schedule' cleared successfully.")
    } catch (error) {
        console.error(">> Error clearing table:", error)
    }
}

async function insertData() {
    try {
        await client.query(`
            INSERT INTO weekly_schedule (day_of_week, time_start, time_end, subject, group_id)
            VALUES 
            ('Monday', '10:00', '11:20', 'English language', 1),
            ('Monday', '12:00', '13:20', 'Basics of working with neural networks', 1),
            ('Tuesday', '08:30', '09:50', 'English language', 1),
            ('Tuesday', '10:00', '11:20', 'Fundamentals of programming', 1),
            ('Tuesday', '12:00', '13:20', 'Mathematical analysis', 1),
            ('Wednesday', '08:30', '09:50', 'Ukrainian language', 1),
            ('Wednesday', '10:00', '11:20', 'Fundamentals of programming', 1),
            ('Wednesday', '12:00', '13:20', 'Basics of working with neural networks', 1),
            ('Thursday', '08:30', '09:50', 'Information and communication technologies', 1),
            ('Thursday', '10:00', '11:20', 'English language', 1),
            ('Friday', '08:30', '09:50', 'Critical thinking', 1),
            ('Friday', '10:00', '11:20', 'Ukrainian language', 1), 
            ('Friday', '13:00', '14:30', 'Information and communication technologies', 1)
        `)

        console.log(">> Data inserted into 'weekly_schedule' table successfully.")

    } catch (error) {
        console.error(">> Error inserting data:", error)
    }
}

async function displaySchedule() {
    try {
        const result = await client.query('SELECT day_of_week, time_start, time_end, subject FROM weekly_schedule ORDER BY CASE WHEN day_of_week = \'Monday\' THEN 1 WHEN day_of_week = \'Tuesday\' THEN 2 WHEN day_of_week = \'Wednesday\' THEN 3 WHEN day_of_week = \'Thursday\' THEN 4 WHEN day_of_week = \'Friday\' THEN 5 ELSE 6 END, time_start')

        console.log("==============================================================")
        console.log("Weekly Schedule:");
        console.log("==============================================================")

        let currentDay = ''
        for (const row of result.rows) {
            if (row.day_of_week !== currentDay) {
                console.log(row.day_of_week)
                console.log("--------------------------------------------------------------")
                currentDay = row.day_of_week;
            }
            console.log(`${row.time_start}-${row.time_end} | ${row.subject}`)
            console.log("--------------------------------------------------------------")
        }

    } catch (error) {
        console.error(">> Error displaying schedule:", error)
    }
}

async function main() {
    await createTables()
    await clearTable() 
    await insertData()
    await displaySchedule()

    await client.end()
}

main().catch(error => console.error("Error:", error))
