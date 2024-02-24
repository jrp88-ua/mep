#[derive(Debug, PartialEq, Eq, Clone)]
pub struct Examinee {
    id: Option<i32>,
    name: String,
    surenames: String,
    origin: ExamineeOrigin,
    court: i16,
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum ExamineeOrigin {
    Baccalaureate,
    VocationalTraining,
    Other(String),
}
