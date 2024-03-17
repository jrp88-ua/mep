// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ctx;
mod event;
mod ipc;
mod models;

use std::sync::{Arc, Mutex};

use ctx::ApplicationState;
use log::LevelFilter;
use tauri_plugin_log::LogTarget;

#[cfg(debug_assertions)]
const LOG_TARGETS: [LogTarget; 2] = [LogTarget::Stdout, LogTarget::Webview];

#[cfg(not(debug_assertions))]
const LOG_TARGETS: [LogTarget; 2] = [LogTarget::Stdout, LogTarget::LogDir];

#[tokio::main]
async fn main() -> Result<(), ()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            crate::ipc::examinee::get_all_examinees,
            crate::ipc::examinee::create_examinee,
            crate::ipc::academic_centre::get_all_academic_centres,
            crate::ipc::academic_centre::create_academic_centre,
            crate::ipc::subject::get_all_subjects,
            crate::ipc::import::start_examinee_import_process,
            crate::ipc::import::perform_examinee_import,
            crate::ipc::import::cancel_examinee_import,
        ])
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets(LOG_TARGETS)
                .with_colors(tauri_plugin_log::fern::colors::ColoredLevelConfig::default())
                .level_for("tauri", log::LevelFilter::Info)
                .level(LevelFilter::Debug)
                .build(),
        )
        .manage(Arc::new(Mutex::new(ApplicationState::new())))
        .manage(Arc::new(Mutex::new(
            Option::<Vec<ipc::import::SheetData>>::None,
        )))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
