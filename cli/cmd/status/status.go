package status

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"karman/pkg"
	"net/http"
	"os"
)

var Cmd = &cobra.Command{
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
	title := fmt.Sprintf("%s (at %s)", name, hostname)
	resp, err := http.Get(pkg.ToUrl(hostname, path))
	if err != nil {
		fmt.Printf("%s is %s: %s\n", title, color.RedString("unavailable"), err)
		*hasFailure = true
		return
	}
	if resp == nil || resp.Status != "200 OK" {

	}
	fmt.Printf("%s is %s\n", title, color.GreenString("available"))
}
