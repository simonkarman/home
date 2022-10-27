package cmd

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"karman/pkg"
	"net/http"
	"os"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Operational status of Karman Home services and applications",
	Run: func(cmd *cobra.Command, args []string) {
		hasFailure := false

		checkStatus(&hasFailure, "Karman Home", pkg.GetLandingHostname(), "")
		checkStatus(&hasFailure, "Identity", pkg.GetIdentityHostname(), "/api/health")
		checkStatus(&hasFailure, "Chat", pkg.GetChatHostname(), "/api/health")

		if hasFailure {
			os.Exit(1)
		}
	},
}

func checkStatus(hasFailure *bool, name string, hostname string, path string) {
	available := color.GreenString("available")
	unavailable := color.RedString("unavailable")

	title := fmt.Sprintf("%s (at %s)", name, hostname)
	resp, err := http.Get(pkg.ToUrl(hostname, path))
	if err != nil || resp == nil || resp.Status != "200 OK" {
		fmt.Printf("%s is %s: %s\n", title, unavailable, err)
		*hasFailure = true
		return
	}
	fmt.Printf("%s is %s\n", title, available)
}

func init() {
	RootCmd.AddCommand(statusCmd)
}
