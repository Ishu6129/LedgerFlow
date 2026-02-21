const express=require("express")
const cookieParser=require("cookie-parser")

const app=express();

app.use(cookieParser())
app.use(express.json())

/**
 * Routes
*/
const authRouter=require("./routes/auth.route.js")
const accountRouter=require("./routes/account.route.js")
const transactionRouter=require("./routes/transaction.route.js")

app.use("/api/auth",authRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/transactions",transactionRouter)

module.exports=app;