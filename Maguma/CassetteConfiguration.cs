using System.IO;

using Cassette.Configuration;
using Cassette.Scripts;
using Cassette.Stylesheets;

namespace Maguma
{
    /// <summary>
    /// Configures the Cassette asset modules for the web application.
    /// </summary>
    public class CassetteConfiguration : ICassetteConfiguration
    {
        public void Configure(BundleCollection bundles, CassetteSettings settings)
        {
            // TODO: Configure your bundles here...
            // Please read http://getcassette.net/documentation/configuration

            var cssSearch = new FileSearch
            {
                Pattern = "*.css",
                SearchOption = SearchOption.TopDirectoryOnly
            }; 
            
            var jsSearch = new FileSearch
            {
                Pattern = "*.js",
                SearchOption = SearchOption.TopDirectoryOnly
            };

            // This default configuration treats each file as a separate 'bundle'.
            // In production the content will be minified, but the files are not combined.
            // So you probably want to tweak these defaults! 

            bundles.Add<StylesheetBundle>("Public/CSS", cssSearch);
            bundles.Add<StylesheetBundle>("Public/CSS/blueprint", cssSearch);
            bundles.Add<StylesheetBundle>("Public/CSS/blueprint/plugins", cssSearch);

            bundles.Add<ScriptBundle>("Public/JavaScript/External", jsSearch);
            bundles.Add<ScriptBundle>("Public/JavaScript", jsSearch);

            //jasmine tests, yes they're in this main project for a reason, so tests can run in the same context as the web app
            //helps wih a few XSS issues in particular for file upload tests
            bundles.Add<ScriptBundle>("Private/Specs/try1");

            // To combine files, try something like this instead:
            //   bundles.Add<StylesheetBundle>("Content");
            // In production mode, all of ~/Content will be combined into a single bundle.
            
            // If you want a bundle per folder, try this:
            //   bundles.AddPerSubDirectory<ScriptBundle>("Scripts");
            // Each immediate sub-directory of ~/Scripts will be combined into its own bundle.
            // This is useful when there are lots of scripts for different areas of the website.

            // *** TOP TIP: Delete all ".min.js" files now ***
            // Cassette minifies scripts for you. So those files are never used.
        }
    }
}