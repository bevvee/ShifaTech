output "ecr_repo_url" {
  value = data.aws_ecr_repository.web_repo.repository_url
}