use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;

use serde::Serialize;
use tauri::command;
use ts_rs::TS;

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum ExportAssignmentError {
    CreateDirectories { path: String },
    CreateFile { file: String },
    WriteFile { file: String },
}

#[command]
pub async fn export_assignment(
    path: String,
    assignment: HashMap<String, String>,
) -> Result<(), ExportAssignmentError> {
    if let Err(_) = fs::create_dir_all(&path) {
        return Err(ExportAssignmentError::CreateDirectories { path });
    }

    for (key, value) in assignment {
        let file_path_str = format!("{}.txt", key);
        let file_path = Path::new(&path).join(file_path_str.clone());

        let mut file = match File::create(&file_path) {
            Ok(file) => file,
            Err(_) => {
                return Err(ExportAssignmentError::CreateFile {
                    file: file_path_str,
                });
            }
        };

        if let Err(_) = write!(file, "{}", value) {
            return Err(ExportAssignmentError::WriteFile {
                file: file_path_str,
            });
        }
    }

    Ok(())
}
