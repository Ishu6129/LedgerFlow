const express=require("express")
const cookieParser=require("cookie-parser")
const path=require("path")

const app=express();

/* Configure EJS as view engine */
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

app.use(cookieParser())
app.use(express.json())

/* API Documentation Route */
app.get("/", (req,res)=>{
    res.render("index")
})

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