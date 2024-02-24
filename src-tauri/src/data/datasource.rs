use super::types::Examinee;

pub trait DataSource {
    fn open_from(path: &str, password: &str) -> Self;

    fn get_examinees(&self) -> Vec<&Examinee>;
}
