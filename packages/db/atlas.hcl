variable "envfile" {
    type    = string
    default = ".env"
}

locals {
  envfile_raw = file(var.envfile)

  envfile = {
    for line in split("\n", local.envfile_raw) :
    trimspace(element(split("=", line), 0)) => trimspace(regex("=(.*)", line)[0])
    if !startswith(trimspace(line), "#") &&
       length(split("=", line)) > 1 &&
       trimspace(line) != ""
  }
  db_url = getenv("DATABASE_URL") != "" ? getenv("DATABASE_URL") : local.envfile["DATABASE_URL"]
}

# command: pnpm --silent exec drizzle-kit export
data "external_schema" "drizzle" {
  program = [
    "pnpm",
    "--silent",
    "exec",
    "drizzle-kit",
    "export",
  ]
}

env "prod" {
  src = data.external_schema.drizzle.url
  url = local.db_url
  dev = "docker://postgres/18/dev?search_path=public"

  migration {
    dir = "file://migrations"
  }
}