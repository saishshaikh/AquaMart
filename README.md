                         AUTHENTICATION
                               │
      ┌────────────────────────┼────────────────────────┐
      │            │           │            │            │
   SIGNUP       SIGNIN     SIGNOUT     GOOGLE AUTH   FORGOT PASSWORD
      │            │           │            │            │
      ▼            ▼           ▼            ▼            ▼

 Receive User   Receive     Clear Token   Google      Enter Email
 Data           Login Data   Cookie       Login          │
(name,email,    (email,       │            │             ▼
password)       password)     ▼            ▼        Check User
      │            │      Logout        Get Google       │
      ▼            ▼      Success       User Data   ┌────┴────┐
Check Existing  Find User                │          │         │
User            By Email                 ▼       Not Found  Found
      │            │               Create/Find      │         │
 ┌────┴────┐       │               User Account     ▼         ▼
 │         │       │                    │        Return    Send Reset
Exists   New User │                    ▼        Error      Link/OTP
 │         │       │              Generate JWT      │         │
 ▼         ▼       │                    │            ▼         ▼
Error   Validate  │                    ▼        Invalid   Reset Password
        Input     │             Set HTTP-Only      │         │
          │       │             Cookie             ▼         ▼
          ▼       │                    │        Return 400 Generate JWT
     Hash Password│                    ▼                  │
          │       │              Google Login            ▼
          ▼       │              Successful        Set Cookie
      Save User   │                                     │
          │       │                                     ▼
          ▼       ▼                              Password Updated
 Generate JWT  Compare Password
          │          │
          ▼          ▼
 Set HTTP-Only  ┌────┴────┐
 Cookie         │         │
          Invalid    Match
             │         │
             ▼         ▼
          Error   Generate JWT
                    │
                    ▼
              Set HTTP-Only Cookie
                    │
                    ▼
              Login Successful
```




## 🔐 Signup Page

A fully animated Authentication Page built with **React, Tailwind CSS, and GSAP**. Users can register and login using their personal information or **Google Authentication**. The system supports three roles: **User, Admin, and Delivery Boy**, with a modern responsive UI, smooth animations, and interactive effects.

<img width="1100" height="898" alt="Signup Page" src="https://github.com/user-attachments/assets/fca56b61-dc22-487a-8c00-8c3f483f96e1" />

---

## 🔑 Signin Page

Secure user login system using **email and password** with password verification, **JWT token generation**, and **HTTP-Only Cookie authentication** for secure access.

<img width="1909" height="897" alt="Signin Page" src="https://github.com/user-attachments/assets/9d40d579-0eb7-4249-b7a4-220763861c75" />

---

## 🔐 Forgot Password

Secure password recovery system that allows users to reset their password through email verification, update their credentials, and regain account access safely.

<img width="1653" height="841" alt="Forgot Password Page" src="https://github.com/user-attachments/assets/17251607-8fa1-4e02-9207-cc09e9daee41" />
