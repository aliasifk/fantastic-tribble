const {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
} = require("@vendure/core");
const { defaultEmailHandlers, EmailPlugin } = require("@vendure/email-plugin");
const { AssetServerPlugin } = require("@vendure/asset-server-plugin");
const { AdminUiPlugin } = require("@vendure/admin-ui-plugin");
const { compileUiExtensions } = require("@vendure/ui-devkit/compiler");
const path = require("path");

const config = {
  apiOptions: {
    port: 3000,
    adminApiPath: "admin-api",
    adminApiPlayground: {
      settings: {
        "request.credentials": "include",
      },
    }, // turn this off for production
    adminApiDebug: true, // turn this off for production
    shopApiPath: "shop-api",
    shopApiPlayground: {
      settings: {
        "request.credentials": "include",
      },
    }, // turn this off for production
    shopApiDebug: true, // turn this off for production
  },
  authOptions: {
    superadminCredentials: {
      identifier: "superadmin",
      password: "superadmin",
    },
  },
  dbConnectionOptions: {
    type: "better-sqlite3",
    synchronize: true, // turn this off for production
    logging: false,
    database: path.join(__dirname, "../vendure.sqlite"),
    migrations: [path.join(__dirname, "../migrations/*.ts")],
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  customFields: {},
  plugins: [
    AssetServerPlugin.init({
      route: "assets",
      assetUploadDir: path.join(__dirname, "../static/assets"),
    }),
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, "../static/email/test-emails"),
      route: "mailbox",
      handlers: defaultEmailHandlers,
      templatePath: path.join(__dirname, "../static/email/templates"),
      globalTemplateVars: {
        // The following variables will change depending on your storefront implementation
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: "http://localhost:8080/verify",
        passwordResetUrl: "http://localhost:8080/password-reset",
        changeEmailAddressUrl:
          "http://localhost:8080/verify-email-address-change",
      },
    }),
    AdminUiPlugin.init({
      route: "admin",
      port: 3002,
      app: compileUiExtensions({
        outputPath: path.join(__dirname, "../admin-ui"),
        extensions: [
          {
            // Points to the path containing our Angular "glue code" module
            extensionPath: path.join(__dirname, "ui-extension/modules"),
            ngModules: [
              {
                // We want to lazy-load our extension...
                type: "lazy",
                // ...when the `/admin/extensions/react-ui`
                // route is activated
                route: "react-ui",
                // The filename of the extension module
                // relative to the `extensionPath` above
                ngModuleFileName: "react-extension.module.ts",
                // The name of the extension module class exported
                // from the module file.
                ngModuleName: "ReactUiExtensionModule",
              },
            ],
            staticAssets: [
              // This is where we tell the compiler to copy the compiled React app
              // artifacts over to the Admin UI's `/static` directory. In this case we
              // also rename "build" to "react-app". This is why the `extensionUrl`
              // in the module config points to './assets/react-app/index.html'.
              {
                path: path.join(__dirname, "ui-extension/react-app/build"),
                rename: "react-app",
              },
            ],
          },
        ],
        devMode: true,
      }),
    }),
  ],
};

module.exports = { config };
