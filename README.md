# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running the Seed Script

To populate your Firestore database with sample data, you need to first authenticate your local environment.

### 1. Authenticate with Google Cloud

You'll need to have the `gcloud` CLI installed. If you don't have it, please follow the installation instructions for your operating system.

Once `gcloud` is installed, run the following command in your terminal to log in and set up Application Default Credentials (ADC):

```bash
gcloud auth application-default login
```

This command will open a browser window for you to log in with your Google account. This is the account that has access to your Firebase project.

### 2. Run the Seed Command

After you've successfully authenticated, you can run the seed script:

```bash
npm run seed
```

This will now have the correct permissions to write to your Firestore database in the `cbre-poc` project.
