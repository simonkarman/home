package cmd

import (
	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"karman/cmd/identity"
	"karman/cmd/status"
	"karman/pkg"
)

var RootCmd = &cobra.Command{
	Version: pkg.Version,
	Use:     "karman",
	Short:   "The CLI for Karman Home",
	Long: `The CLI for Karman Home.

Karman Home is an application set that provides user identity and chat message functionalities.`,
	SilenceUsage: true,
}

func init() {
	RootCmd.CompletionOptions.HiddenDefaultCmd = true

	// No Color
	var noColorFlag *bool
	RootCmd.PersistentPreRun = func(cmd *cobra.Command, args []string) {
		if *noColorFlag {
			color.NoColor = true
		}
	}
	noColorFlag = RootCmd.PersistentFlags().Bool("no-color", false, "Disable color output")

	// Status
	RootCmd.AddCommand(status.Cmd)
	
	// Identity
	RootCmd.AddCommand(identity.Cmd)
}
