use serde::Serialize;
use std::fmt::Debug;
use ts_rs::TS;

#[derive(TS, Serialize, Clone, Debug)]
#[ts(export, export_to = "../src/types/")]
pub struct ApplicationEvent<D: Serialize + Clone> {
    /**
     * Identifier for the event
     */
    pub event: String,
    /**
     * Who is emmiting the event
     */
    pub source: String,

    /**
     * Payload of the event
     */
    #[serde(skip_serializing_if = "Option::is_none")]
    pub payload: Option<D>,
}
