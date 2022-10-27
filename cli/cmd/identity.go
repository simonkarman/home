package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"io"
	"karman/pkg"
	"net/http"
	"os"
)

var identityCmd = &cobra.Command{
	Use:   "identity",
	Short: "Manage Karman Home identities",
}

var identitySessionCmd = &cobra.Command{
	Use:   "session",
	Short: "Manage your Karman Home identity session",
	Run: func(cmd *cobra.Command, args []string) {
		context, err := pkg.GetContext()
		if err != nil {
			fmt.Println(err.Error())
			os.Exit(1)
		}
		req, err := http.NewRequest("GET", pkg.ToUrl(pkg.GetIdentityHostname(), "/api/sessions"), nil)
		if err != nil {
			fmt.Println(err.Error())
			os.Exit(1)
		}
		req.AddCookie(&http.Cookie{Name: "session-token", Value: context.SessionToken})
		resp, err := (&http.Client{}).Do(req)
		if err != nil {
			fmt.Println(err.Error())
			os.Exit(1)
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			fmt.Println(err.Error())
			os.Exit(1)
		}
		fmt.Print(string(body))
	},
}

func init() {
	RootCmd.AddCommand(identityCmd)
	identityCmd.AddCommand(identitySessionCmd)
}
