use serde::Serialize;

pub trait ToErrorIdentifider {
    fn error_identifier(&self) -> String;
}

#[derive(Serialize)]
pub struct IpcResponse<D>
where
    D: Serialize,
{
    error: Option<String>,
    result: Option<D>,
}

impl<D, E> From<Result<D, E>> for IpcResponse<D>
where
    D: Serialize,
    E: ToErrorIdentifider,
{
    fn from(value: Result<D, E>) -> Self {
        match value {
            Ok(result) => IpcResponse {
                error: None,
                result: Some(result),
            },
            Err(error) => IpcResponse {
                error: Some(error.error_identifier()),
                result: None,
            },
        }
    }
}

impl<D> IpcResponse<D>
where
    D: Serialize,
{
    pub fn ok(value: D) -> Self {
        IpcResponse {
            error: None,
            result: Some(value),
        }
    }
}
