# 🔐 Authentication Flow

```text
                         AUTHENTICATION
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
      SIGNUP                SIGNIN               SIGNOUT
         │                     │                     │
         ▼                     ▼                     ▼

1 ) User Auth

  Receive User Data     Receive Login Data     Clear Token Cookie
   (name, email,        (email, password)           │
   password, etc.)             │                    ▼
         │                     ▼              Logout Success
         ▼              Find User by Email
 Check Existing User            │
         │               ┌──────┴──────┐
    ┌────┴────┐          │             │
    │         │      Not Found      User Found
 Exists    New User         │             │
    │         │             ▼             ▼
    ▼         ▼       Return 404     Compare Password
 Return Error Validate Input          │
            │                 ┌──────┴──────┐
            ▼                 │             │
      Hash Password      Invalid      Password Match
            │           Credentials         │
            ▼                 │             ▼
        Save User        Return 400    Generate JWT
            │                             │
            ▼                             ▼
      Generate JWT                 Set HTTP-Only Cookie
            │                             │
            ▼                             ▼
     Set HTTP-Only Cookie          Login Successful
            │
            ▼
     Signup Successful
```
