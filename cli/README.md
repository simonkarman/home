Karman Home CLI
---

During development, you can create the following alias:
`alias karman='go run main.go'`. This allows you to run `karman <subcommand>` while changing the code.

Next, run `karman --help` to see all available commands.

## Build
To build the `karman` binary you can run the following command. You can replace the version number.
```bash
go build -o karman --ldflags="-X 'karman/pkg.Version=0.0.1'" && ./karman --version
```
