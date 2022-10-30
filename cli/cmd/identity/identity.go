package identity

import (
	"github.com/spf13/cobra"
	"karman/cmd/identity/session"
)

var Cmd = &cobra.Command{
	Use:          "identity",
	Short:        "Manage Karman Home identities",
	SilenceUsage: true,
}

func init() {
	// Session
	Cmd.AddCommand(session.Cmd)
}
