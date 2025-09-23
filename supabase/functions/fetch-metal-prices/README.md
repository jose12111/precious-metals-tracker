# Supabase Edge Function: fetch-metal-prices

This function is designed to fetch live gold and silver prices.

## Deployment

1.  **Install Supabase CLI:** If you haven't already, install the Supabase CLI:
    ```bash
    npm install -g supabase
    ```
2.  **Login to Supabase CLI:**
    ```bash
    supabase login
    ```
3.  **Link your project:** Navigate to your project's root directory and link it to your Supabase project:
    ```bash
    supabase link --project-ref your-project-id
    ```
    (You can find your project ID in your Supabase dashboard URL: `https://app.supabase.com/project/YOUR_PROJECT_ID/...`)
4.  **Deploy the function:**
    ```bash
    supabase functions deploy fetch-metal-prices --no-verify-jwt
    ```
    The `--no-verify-jwt` flag is used here because this function is intended to be called directly from your client-side application without requiring a JWT for authentication. If you later add authentication to your function, you might remove this flag.

## Environment Variables (for real API integration)

If you integrate with a real external metal price API, you will likely need an API key. To keep this secure, you should store it as a Supabase secret.

1.  **Add a secret:**
    ```bash
    supabase secrets set METAL_PRICE_API_KEY="your_actual_api_key_here"
    ```
2.  **Access in function:** In `supabase/functions/fetch-metal-prices/index.ts`, you can access this secret using `Deno.env.get("METAL_PRICE_API_KEY")`. Remember to uncomment and implement the actual API call logic.

## After Deployment

Once deployed, Supabase will provide you with a URL for this function. It will look something like:
`https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-metal-prices`

You will need to update the `SUPABASE_METAL_PRICES_FUNCTION_URL` constant in `src/services/metalPrices.ts` with this actual URL.