use rusqlite::Connection;
use std::sync::Mutex;
use tauri::State;

pub struct DatabaseConnection {
    connection: Connection,
}

#[derive(Default)]
pub struct DatabaseState(Mutex<Option<DatabaseConnection>>);

#[derive(Debug, thiserror::Error)]
pub enum OpenDatabaseError {
    #[error(transparent)]
    OpenError(#[from] rusqlite::Error),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl serde::Serialize for OpenDatabaseError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

#[tauri::command]
pub fn open_db_file_with_password(
    app_handle: tauri::AppHandle,
    database: State<DatabaseState>,
    file: &str,
    password: &str,
) -> Result<bool, OpenDatabaseError> {
    let connection_state = database.0.lock().unwrap().take();
    if let Some(db) = connection_state {
        drop(db.connection);
    }

    let new_connection = Connection::open(file)?;
    new_connection.pragma_update(None, "key", password.to_owned() + "JUAN")?;

    let str = verify_db_schema(&new_connection)?;

    let new_connection = DatabaseConnection {
        connection: new_connection,
    };
    *database.0.lock().unwrap() = Some(new_connection);

    Ok(str)
}

#[derive(Debug)]
struct TableData {
    table_name: String,
    table_schema: String,
}

fn verify_db_schema(connection: &Connection) -> Result<bool, OpenDatabaseError> {
    let mut statement = connection.prepare("SELECT * FROM sqlite_master WHERE type='table'")?;
    let tables_iter = statement.query_map([], |row| {
        Ok(TableData {
            table_name: row.get("name")?,
            table_schema: row.get("sql")?,
        })
    })?;

    Ok(true)
}
