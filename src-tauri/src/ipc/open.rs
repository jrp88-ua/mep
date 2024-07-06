use serde::Serialize;
use tauri::command;
use ts_rs::TS;

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum OpenFileError {
    Io,
    Internal,
    Status(Option<i32>),
}

#[command]
pub async fn open_file(path: String) -> Result<(), OpenFileError> {
    if let Err(e) = opener::open(path) {
        return Err(match e {
            opener::OpenError::Io(_) => OpenFileError::Io,
            opener::OpenError::Spawn { cmds: _, source: _ } => OpenFileError::Internal,
            opener::OpenError::ExitStatus {
                cmd: _,
                status,
                stderr: _,
            } => OpenFileError::Status(status.code()),
            _ => OpenFileError::Internal,
        });
    }
    Ok(())
}
