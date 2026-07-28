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

  ## 🔐 Signup Page

A fully animated Signup Page built with **React, Tailwind CSS, and GSAP**. Users can register using their personal information or login with **Google Authentication**. Features a modern responsive UI with smooth animations and interactive effects.

  
<img width="1000" height="898" alt="image" src="https://github.com/user-attachments/assets/fca56b61-dc22-487a-8c00-8c3f483f96e1" />
