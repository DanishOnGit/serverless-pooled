import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate';
import { decode, sign, verify } from 'hono/jwt'

const app = new Hono<{
  Bindings:{
    DATABASE_URL: string
  }
}>()

//we initialze prisma client for every route becoz, in a srvrless environemnt, these route functions are brought up anywhere and can lose global context. hence we keep initiualizing in the route. Keep globals to a minimum in a srvrless env


//"c" stands for "context"
app.get('/', (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
  return c.text('Hello Hono!')
})

app.post("/api/v1/signup",async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

const body= await c.req.json();
const payload={
  email:body.email,
  password:body.password
}
 const user= await prisma.user.create({
    data:payload
  })
  const token = await sign({id:user.id}, "secret")
  return c.json({
    jwt:token
  })

})
app.post("/api/v1/signin",async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

const body= await c.req.json();
const user = prisma.user.findUnique({
  where:{
    email:body.email
  }
})

if(!user){
  c.status(403)
  return c.json({
    err:"No such email found"
  })
}

const decodedData= await verify(body.token,"secret");
if(decodedData.id){
  return c.json({
    data:decodedData
  })
}else{
  c.status(401);
  c.json({
    err:"Unathorized"
  })
}

})
app.post("/api/v1/blog",(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
  return c.text('Hello Hono!')

})
app.put("/api/v1/blog",(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
  return c.text('Hello Hono!')

})
app.get("/api/v1/blog/:id",(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
  const blogId=c.req.param("id")
  return c.text('Hello Hono!')

})

export default app
