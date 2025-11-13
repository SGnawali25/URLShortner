# Sandy URL Shortener

Sandy URL Shortener is a web-based application that allows users to shorten URLs, manage their links, and track them. Users can sign in with Google, view their dashboard, and manage their URLs. Admins have additional privileges, such as viewing all users’ URLs and deleting any URL.

## Production URLs

- **Frontend:** [https://sandyurl.pages.dev](https://sandyurl.pages.dev)  

> Note: Always use the frontend URL to access the application. All frontend requests are routed to the backend API automatically.

## Features

### For Users
- Sign in using Google OAuth.
- Shorten long URLs.
- View your dashboard with all your shortened URLs.
- Delete URLs you have created.
- View the creation date of each URL.

### For Admins
- View all users' shortened URLs.
- Delete any URL in the system.
- View which user created each URL.

## How to Use

1. **Open the App:**  
   Go to [https://sandyurl.pages.dev](https://sandyurl.pages.dev) in your browser.

2. **Sign In:**  (Optional)
   Click the **Google login** button to authenticate.

3. **Shorten a URL:**  
   - Enter the original URL in the input field.  
   - Click **Shorten**.  
   - The shortened URL will appear and be added to your dashboard.

4. **Manage URLs:**  
   - Click on a shortened URL to visit the link.  
   - To delete a URL:
     - Users can delete only the URLs they created.
     - Admins can delete any URL.

5. **Logout:**  
   Click your avatar in the header and select **Logout**. Your dashboard will clear automatically.

## URL Format

All shortened URLs follow this format:

https://sandyurl.pages.dev/<shortCode>

## Notes

- URLs are stored securely on the backend.
- Google login requires a valid Google account authorized for this app.

