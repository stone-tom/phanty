variable "envfile" {
    type    = string
    default = ".env"
}

locals {
    envfile = {
        for line in split("\n", file(var.envfile)): split("=", line)[0] => regex("=(.*)", line)[0]
        if !startswith(line, "#") && length(split("=", line)) > 1
    }
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
  url = local.envfile["DATABASE_URL"]
  dev = "docker://postgres/18/dev?search_path=public"

  migration {
    dir = "file://migrations"
  }
}