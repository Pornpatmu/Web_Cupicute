
// import module
const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const authorize = require("./middleware/auth");
const jwt = require('jsonwebtoken');
const cors = require('cors');



/* --------------------------*/
dotenv.config();
const app = express();
const Admin = express.Router();


/* --------------------------*/
// ใช้ middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --------------------------*/

/* CORS */
let corsOptions = {
    origin: 'http://localhost:3001', // โดเมนที่อนุญาต
    methods: 'GET,POST,PUT,DELETE', // เมธอดที่อนุญาต

};

app.use(cors(corsOptions));

/* --------------------------*/

// เชื่อมต่อฐานข้อมูล
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
connection.connect(function (err) {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);  //หยุดการทำงานของ server
    }
    console.log(`Connected DB: ${process.env.DB_NAME}`);
});
/* --------------------------*/

app.use('/', Admin);

//  404 ไม่พบเส้นทาง
app.use((req, res, next) => {
    res.status(404).send('Page Not Found');
});
// Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
})


// /* กำหนดเส้นทางสำหรับการดึงข้อมูลจากฐานข้อมูล

//                      Product Service
//                                                             /*/
// //Insert
// /*---------------------Testing------------------------------
//                 ***[ test1 Insert product ]***
//                     method: post
//                     URL: http://localhost:3002/product
//                   'Authorization': `Bearer ${token}`,
//                     body raw JSON
//                     {
//                      "ProductID": "011",
//                      "product": {
//                          "ProductName": "Sharp Romance Mascara",
//                          "Price": "199.00",
//                          "P_Description": "This mascara offers intense volume and lift while keeping lashes beautifully separated and clump-free, perfect for creating a look that’s both striking and romantic. Its formula is long-lasting and smudge-proof, giving you flawless lashes that captivate.",
//                          "CategoryID": "4"
//                          }
//                        }

// --------------------------------------------------------*/
//                 ***[ test2 Insert product ]***
//                     method: post
//                     URL: http://localhost:3002/product
//                   'Authorization': `Bearer ${token}`,
//                     body raw JSON
//                   {
//                  "ProductID": "015",
//                  "product": {
//                      "ProductName": "Sweetheart Sheer Foundation",
//                      "Price": "499.00",
//                      "P_Description": "This lightweight, sheer-coverage foundation enhances your skin's natural tone, delivering a soft, radiant finish that feels like a second skin. Perfect for those who prefer a barely-there look, Sweetheart Sheer Foundation smooths and blurs imperfections while letting your true beauty shine through.",
//                      "CategoryID": "2"
//                          }
//                       }
// --------------------------------------------------------*/
// ============  PRODUCT Insert    ============ */
Admin.post('/product', function (req, res) {
    let product = req.body;
    const { ProductID, ProductName, Price, P_Description, CategoryID } = req.body;
    console.log('Received ProductID:', ProductID);

    if (!product) {
        return res.status(400).send({
            error: true,
            message: 'Please provide Product information'
        });
    }
    console.log('Received CategoryID:', CategoryID);

    const values = [ProductID, ProductName, Price, P_Description, CategoryID];
    console.log('Values to insert:', values);
    connection.query("INSERT INTO product (ProductID, ProductName, Price, P_Description, CategoryID) VALUES (?,?,?,?,?)", 
        values, function (error, results) {
        if (error) {
            console.error('Database error:', error); // แสดง error ถ้ามีปัญหากับ query
            return res.status(500).send({
                error: true,
                message: 'An error occurred while saving the product.'
            });
        }
        return res.status(200).send({
            error: false,
            data: results,
            message: 'New Product has been created successfully'
        });
    });
});

// /* UPDATE*/
// /*---------------------Testing------------------------------
//                 ***[ test1 update product's name]***
//                 method: put
//                 URL:  http://localhost:3002/product/:id
//                   'Authorization': `Bearer ${token}`,
//                 body raw JSON
//                  {
//                      "ProductID": "002",
//                      "product": {
//                          "ProductName": "OxO Blam Lipstick",
//                           "Price": "299.00",
//                           "P_Description": "This luxurious matte lipstick delivers a rich, velvety finish with intense color payoff that lasts all day. Specially formulated for comfort, Kisses Matte Lipstick glides on smoothly without drying, leaving your lips feeling soft and plush.",
//                           "CategoryID": "1"
//                          }
//                        }
// --------------------------------------------------------------*/
//                 ***[ test2 update product's price ]***
//                 method: put
//                 URL:  http://localhost:3002/product/:id
//                   'Authorization': `Bearer ${token}`,
//                 body raw JSON
//                  {
//                  "ProductID": "001",
//                  "product": {
//                      "ProductName": "Venus Heart Tint",
//                      "Price": "399.00",
//                      "P_Description": "This luxurious lip product is designed to deliver a captivating blend of color and hydration, leaving your lips feeling soft and looking radiant. Infused with a unique blend of nourishing ingredients, Lucky Charm Blam not only enhances the natural beauty of your lips but also provides long-lasting, comfortable wear.",
//                      "CategoryID": "1"
//                      }
//                    }
// --------------------------------------------------------------*/
// ==  PRODUCT Update    == 
Admin.put('/product/:id', function (req, res) {
    const { ProductID, product } = req.body;
    const productIdFromBody = ProductID || req.params.id;  // ใช้ ProductID จาก body หรือจาก URL

    console.log('Received ID:', productIdFromBody);
    console.log('Received Payload:', JSON.stringify(req.body, null, 2));

    // ตรวจสอบว่า ProductID และ product ถูกส่งมาครบถ้วน
    if (!productIdFromBody || !product || typeof product !== 'object') {
        return res.status(400).send({
            error: true,
            message: 'Please provide valid ProductID and product details',
        });
    }

    // อัปเดตสินค้าในฐานข้อมูล
    connection.query(
        "UPDATE product SET ? WHERE ProductID = ?",
        [product, productIdFromBody],  // ใช้ productIdFromBody แทน req.params.id
        function (error, results) {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).send({
                    error: true,
                    message: 'Internal Server Error',
                });
            }

            // ตรวจสอบว่ามีการอัปเดตจริงหรือไม่
            if (results.affectedRows === 0) {
                return res.status(404).send({
                    error: true,
                    message: `No product found with ProductID: ${productIdFromBody}`,
                });
            }

            // ส่ง Response กลับไปยัง Client
            return res.send({
                error: false,
                data: results,
                message: 'Product has been updated successfully',
            });
        }
    );
});

// /* DELETE */
// /*---------------------Testing------------------------------
//                 ***[ test1 delete product]***
//                 method: delete
//                 URL: http://localhost:3002/product
//                 'Authorization': `Bearer ${token}`,
//                 body: raw JSON
//                  {
//                  "ProductID": "011",
//                  "product": {
//                      "ProductName": "Sharp Romance Mascara",
//                      "Price": "199.00",
//                      "P_Description": "This mascara offers intense volume and lift while keeping lashes beautifully separated and clump-free, perfect for creating a look that’s both striking and romantic. Its formula is long-lasting and smudge-proof, giving you flawless lashes that captivate.",
//                      "CategoryID": "4"
//                      }
//                    }
// --------------------------------------------------------------*/
//                 ***[ test2 delete product]***
//                 method: delete
//                 URL: http://localhost:3002/product
//                 'Authorization': `Bearer ${token}`,
//                 body: raw JSON
//                  {
//                  "ProductID": "001",
//                  "product": {
//                      "ProductName": "Venus Heart Tint",
//                      "Price": "399.00",
//                      "P_Description": "This luxurious lip product is designed to deliver a captivating blend of color and hydration, leaving your lips feeling soft and looking radiant. Infused with a unique blend of nourishing ingredients, Lucky Charm Blam not only enhances the natural beauty of your lips but also provides long-lasting, comfortable wear.",
//                      "CategoryID": "1"
//                      }
//                     }

// --------------------------------------------------------------*/
// ==  PRODUCT Delete    == 
Admin.delete('/product', function (req, res) {
    console.log('Received DELETE Request:');
    console.log('Body:', req.body); // Debug เพื่อดูว่า ProductID ถูกส่งมาหรือไม่

    let ProductID = req.body.ProductID;

    if (!ProductID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide ProductID',
        });
    }

    connection.query('DELETE FROM product WHERE ProductID = ?', [ProductID], function (error, results) {
        if (error) {
            console.error('Error in SQL query:', error);
            throw error;
        }
        return res.send({
            error: false,
            data: results.affectedRows,
            message: 'Product has been deleted successfully',
        });
    });
});

// // Select by Product ID
// /*---------------------Testing------------------------------
//                 ***[ test select product by Product ID ]***
//                     method: get
//                     URL: http://localhost:3002/product/:id
// --------------------------------------------------------------*/
// == PRODUCT Select    == 
Admin.get('/product/:id', function (req, res) {
    let ProductID = req.params.id;

    if (!ProductID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide ProductID'
        });
    }
    connection.query("SELECT * FROM product WHERE ProductID = ?", [ProductID], function (error, results) {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).send({
                error: true,
                message: 'Product not found.'
            });
        }

        return res.send({
            error: false,
            data: results[0],
            message: 'Product retrieved'
        });
    });
});

// //Selectall
// /*---------------------Testing------------------------------
//                 ***[ test select all products ]***
//                     method: get
//                     URL: http://localhost:3002/products
// --------------------------------------------------------*/
// ==  PRODUCT Select all    == 
Admin.get('/products', function (req, res) {
    connection.query("SELECT * FROM product", function (error, results) {
        if (error) throw error;
        return res.send({
            error: false,
            data: results,
            message: 'Product list'
        });
    });
});

// //Select
// /*---------------------Testing------------------------------
//                 ***[ test1 product for products searching ]***
//                     method: get
//                     URL: http://localhost:3002/productsearch?search=Kisses

// --------------------------------------------------------*/
//                 ***[ test2 product for products searching ]***
//                     method: get
//                     URL: http://localhost:3002/productsearch

// --------------------------------------------------------*/
// ==  PRODUCT search  == 
Admin.get('/productsearch', function (req, res) {
    const { search } = req.query; // รับ query parameter ชื่อ search
    let sql = "SELECT * FROM product";
    const params = [];

    if (search) {
        sql += " WHERE ProductID LIKE ? OR ProductName LIKE ?";
        params.push(`%${search}%`, `%${search}%`);
    }

    connection.query(sql, params, function (error, results) {
        if (error) {
            console.error('Error in SQL query:', error);
            return res.status(500).send({ error: true, message: 'Internal Server Error' });
        }

        return res.send({
            error: false,
            data: results,
            message: results.length ? 'Product list retrieved successfully' : 'No products found',
        });
    });
});



// /*
//                      Admin Service
//                                                             /*/

// // Select by  Admin by ID
// /*---------------------Testing------------------------------
//                 ***[ test select Admin by  ID ]***
//                     method: get
//                     URL: http://localhost:3002/userAdmin/:id
//                   'Authorization': `Bearer ${token}`,
// --------------------------------------------------------------*/
// ==  Admin Select    == 
Admin.get('/userAdmin/:id',function (req, res) {
    let UserID = req.params.id;

    if (!UserID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide UserID'
        });
    }

    // ใช้คำสั่ง JOIN เพื่อดึงข้อมูลทั้งสองตาราง
    connection.query(
        `SELECT u.UserID, u.Username, u.U_Password AS Password, 
                a.FirstName, a.LastName, a.PhoneNumber, a.Email, a.AdminID
        FROM user u
        JOIN admin a ON u.AdminID = a.AdminID
        WHERE u.UserID = ?
`,
        [UserID],
        function (error, results) {
            if (error) {
                console.error(error);
                return res.status(500).send({
                    error: true,
                    message: 'Database query error'
                });
            }

            if (results.length === 0) {
                return res.status(404).send({
                    error: true,
                    message: 'User not found'
                });
            }

            return res.send({
                error: false,
                data: results[0],
                message: 'User and Admin data retrieved successfully'
            });
        }
    );
});


// /*---------------------Testing------------------------------
//                 Testing select all admin
//                 method: get
//                 URL: http://localhost:3002/userAdmins
//                 'Authorization': `Bearer ${token}`,
//                 body: pretty JSON
// --------------------------------------------------------*/
// ==  Admin Select all   ==
Admin.get('/userAdmins', function (req, res) {
    connection.query(
        `SELECT u.UserID, u.Username, u.U_Password, u.LoginTimestamp, u.User_Image, 
                a.AdminID, a.FirstName, a.LastName, a.PhoneNumber, a.Address, a.Email
         FROM user u
         JOIN admin a ON u.AdminID = a.AdminID`,
        function (error, results) {
            if (error) throw error;
            return res.send({
                error: false,
                data: results,
                message: 'User and Admin list retrieved successfully'
            });
        }
    );
});

// /*---------------------Testing------------------------------
//                   Test1 Insert new admin
//                   method: post
//                   URL: http://localhost:3002/userAdmin
//                   'Authorization': `Bearer ${token}`,
//                   body: raw JSON
//                {
//                  "user": {
//                      "UserID": "106",
//                      "UserName": "bas_pht",
//                      "U_Password": "bas2547"
//                     },
//                    "admin": {
//                      "AdminID": "6583219",
//                      "FirstName": "Phongpisut",
//                      "LastName": "Thongrot",
//                      "Email": "baspht2546@gmail.com",
//                      "PhoneNumber": "0620476327"
//                     }
//                  }

//   --------------------------------------------------------*/
//                   Test2 Insert new admin
//                   method: post
//                   URL: http://localhost:3002/userAdmin
//                   'Authorization': `Bearer ${token}`,
//                   body: raw JSON
//                 {
//                  "user": {
//                      "UserID": "107",
//                      "UserName": "punpun77",
//                      "U_Password": "pun2553"
//                 },
//                  "admin": {
//                      "AdminID": "6569627",
//                      "FirstName": "Patthadon",
//                      "LastName": "Sukasep",
//                      "Email": "punpunronuldo@gmail.com",
//                      "PhoneNumber": "0816568455"
//                      }
//                  }
//   --------------------------------------------------------*/

// ==  Admin Insert   ==
Admin.post('/userAdmin', (req, res) => {
    let { user, admin } = req.body;

    console.log('Received data:', req.body);

    if (!user || !admin) {
        return res.status(400).send({
            error: true,
            message: 'Please provide both User and Admin information'
        });
    }

    // ตรวจสอบค่าต่างๆ ภายใน user และ admin
    if (!user.UserID || !user.U_Password) {
        return res.status(400).send({
            error: true,
            message: 'Missing required user fields'
        });
    }

    if (!admin.AdminID) {
        return res.status(400).send({
            error: true,
            message: 'Missing required admin fields'
        });
    }

    // เพิ่มข้อมูล Admin ก่อน
    connection.query("INSERT INTO admin SET ?", admin, function (error, adminResults) {
        if (error) {
            console.error('Error while inserting admin data:', error.message); // เพิ่มข้อความ error ที่ชัดเจน
            return res.status(500).send({
                error: true,
                message: 'Error while inserting admin data',
                details: error // ส่งรายละเอียด error กลับ
            });
        }
        console.log('Admin inserted successfully:', adminResults);

        // นำ AdminID ที่ได้รับไปใช้กับ User
        user.AdminID = admin.AdminID;

        connection.query("INSERT INTO user SET ?", user, function (error, userResults) {
            if (error) {
                console.error('Error while inserting user data:', error);
                return res.status(500).send({
                    error: true,
                    message: 'Error while inserting user data',
                    details: error
                });
            }
            return res.send({
                error: false,
                data: { admin: adminResults.affectedRows, user: userResults.affectedRows },
                message: 'User and Admin have been created successfully'
            });
        });
    });
});

// /*---------------------Testing------------------------------
//                   Test1 UPDATE  Admin's Email
//                   method: put
//                   URL: http://localhost:3002/userAdmin/:userId
//                   'Authorization': `Bearer ${token}`,
//                   body: raw JSON
//                  {
//                  "user": {
//                      "UserID": "107",
//                      "UserName": "punpun77",
//                      "U_Password": "pun2553"
//                  },
//                    "admin": {
//                       "AdminID": "6569627",
//                       "FirstName": "Patthadon",
//                       "LastName": "Sukasep",
//                       "Email": "punpunronaldo@gmail.com",
//                         "PhoneNumber": "0816568455"
//                      }
//                  }
//   --------------------------------------------------------*/
//                   Test2 UPDATE Admin's Phone
//                   method: put
//                   URL: http://localhost:3002/userAdmin/:userId
//                   'Authorization': `Bearer ${token}`,
//                   body: raw JSON
//                 {
//                  "user": {
//                      "UserID": "101",
//                      "UserName": "taechine_03",
//                      "U_Password": "Ggrace2547"
//                  },
//                    "admin": {
//                      "AdminID": "6687003",
//                      "FirstName": "Taechinee",
//                      "LastName": "Ratanwimon",
//                      "Email": "taechinee.rat@student.mahidol.edu",
//                      "PhoneNumber": "0891619991"
//                      }
//                  }
//   --------------------------------------------------------*/

// ==  ADMIN Update    == 
Admin.put('/userAdmin/:userId', function (req, res) {
    let { user, admin } = req.body;  // รับข้อมูล user และ admin จาก body
    const userId = req.params.userId; // รับ UserID จาก parameter

    console.log('Received data:', req.body);
    console.log('User ID:', userId);

    if (!user || !admin) {
        return res.status(400).send({
            error: true,
            message: 'Please provide both User and Admin information.'
        });
    }

    // ตรวจสอบค่าต่างๆ ภายใน user และ admin
    if (!user.UserID || !user.U_Password) {
        return res.status(400).send({
            error: true,
            message: 'Missing required user fields.'
        });
    }

    if (!admin.AdminID) {
        return res.status(400).send({
            error: true,
            message: 'Missing required admin fields.'
        });
    }

    // อัปเดตข้อมูลในตาราง admin
    connection.query("UPDATE admin SET ? WHERE AdminID = ?", [admin, admin.AdminID], function (error, adminResults) {
        if (error) {
            console.error('Error while updating admin data:', error.message);
            return res.status(500).send({
                error: true,
                message: 'Error while updating admin data.',
                details: error
            });
        }
        console.log('Admin updated successfully:', adminResults);

        // อัปเดตข้อมูลในตาราง user
        user.AdminID = admin.AdminID;  // อัปเดต AdminID ให้กับ User

        connection.query("UPDATE user SET ? WHERE UserID = ?", [user, userId], function (error, userResults) {
            if (error) {
                console.error('Error while updating user data:', error);
                return res.status(500).send({
                    error: true,
                    message: 'Error while updating user data.',
                    details: error
                });
            }
            if (userResults.affectedRows === 0) {
                return res.status(404).send({
                    error: true,
                    message: 'User not found.'
                });
            }
            return res.send({
                error: false,
                data: { admin: adminResults.affectedRows, user: userResults.affectedRows },
                message: 'User and Admin have been updated successfully.'
            });
        });
    });
});



// /*---------------------Testing------------------------------
//                   Test1 DELETE admin
//                   method: delete
//                   URL: http://localhost:3002/userAdmin
//                   body: raw JSON
//                   'Authorization': `Bearer ${token}`,
//   {
//               "IDadmin": "Am11"
             
//   }
//   --------------------------------------------------------*/
//                   Test2 DELETE admin
//                   method: delete
//                   URL: http://localhost:3002/userAdmin
//                   body: raw JSON
//                   'Authorization': `Bearer ${token}`,
//   {
//               "IDadmin": "Am11"
             
//   }
//   --------------------------------------------------------*/
// ==  ADMIN Delete    == 
Admin.delete('/userAdmin/:id', (req, res) => {
    const userID = req.params.id;

    console.log('Received UserID for deletion:', userID);

    if (!userID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide a valid UserID',
        });
    }

    // ลบข้อมูล User ก่อน
    connection.query("DELETE FROM user WHERE UserID = ?", [userID], (userError, userResults) => {
        if (userError) {
            console.error('Error while deleting user data:', userError.message);
            return res.status(500).send({
                error: true,
                message: 'Error while deleting user data',
                details: userError,
            });
        }

        if (userResults.affectedRows === 0) {
            return res.status(404).send({
                error: true,
                message: `No user found with UserID: ${userID}`,
            });
        }

        console.log('User deleted successfully:', userResults);

        // ลบข้อมูล Admin ที่เกี่ยวข้อง (อิงจาก AdminID ที่อยู่ใน User)
        connection.query("DELETE FROM admin WHERE AdminID = (SELECT AdminID FROM user WHERE UserID = ?)", [userID], (adminError, adminResults) => {
            if (adminError) {
                console.error('Error while deleting admin data:', adminError.message);
                return res.status(500).send({
                    error: true,
                    message: 'Error while deleting admin data',
                    details: adminError,
                });
            }

            console.log('Admin deleted successfully:', adminResults);

            return res.status(200).send({
                error: false,
                message: 'User and associated Admin data deleted successfully',
            });
        });
    });
});
// /*---------------------Testing------------------------------
//                   Test1 Signin admin (username: pornpat_39)
//                   method: post
//                   URL: http://localhost:3002/signin
//                   body: raw JSON

                //  {
                //  "username" : "pornpat_39",
                //  "password" : "fernfern2548"
                //   }
             
//   --------------------------------------------------------*/
//                   Test2 Signin admin (username: wanlida_70)
//                   method: post
//                   URL: http://localhost:3002/signin
//                   body: raw JSON

//                  {
//                  "username" : "wanlida_70",
//                  "password" : "pondpond2547"
//                   }
             
//   --------------------------------------------------------*/
/* --------------------------*/
//เส้นทางในการเข้าสู่ระบบ (สร้างtoken)
Admin.post("/signin", (req, res) => {
    console.log(req.body);

    let { username, password } = req.body;

    connection.query(
        "SELECT * FROM user WHERE Username = ? AND U_Password = ?",
        [username, password],
        (error, results) => {
            if (error)
                return res.status(500).json({ error: "Database error" });
            if (results.length === 0) {
                return res.status(401).json({ error: "Invalid username or password" });
            }
            let jwtToken = jwt.sign(
                { user: username },
                process.env.SECRET,
                { expiresIn: "1h" } // 1 ชม. หมดอายุ
            );
            res.status(200).json({
                token: jwtToken,
                message: "Login successful"

            });
        }
    );
});
//เส้นทางในการออกจากระบบ (ดูว่าclientลบtokenรึยัง)
// /*---------------------Testing------------------------------
//                   Test1 logout admin (username: pornpat_39)
//                   method: post
//                   URL: http://localhost:3002/logout
//                   'Authorization': `Bearer ${token}`,
//   --------------------------------------------------------*/
//                   Test2 logout admin (username: wanlida_70)
//                   method: post
//                   URL: http://localhost:3002/logout
//                   'Authorization': `Bearer ${token}`,
//   --------------------------------------------------------*/

Admin.post("/logout",authorize, (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});


// /*---------------------Testing------------------------------
//                   Test1 UserAdminProfile admin (username: pornpat_39)
//                   method: post
//                   URL: http://localhost:3002/UserAdminProfile
//                   body: raw JSON
//                   'Authorization': `Bearer ${token}`,
             
//   --------------------------------------------------------*/
//                   Test2 UserAdminProfile admin (username: wanlida_70)
//                   method: post
//                   URL: http://localhost:3002/UserAdminProfile
//                   body: raw JSON
//                   'Authorization': `Bearer ${token}`,
             
//   --------------------------------------------------------*/
//ดึงโปรไฟล์จากtoken
Admin.get("/UserAdminProfile", authorize, (req, res) => {
    if (!req.decoded || !req.decoded.user) {
        return res.status(401).json({ message: "Unauthorized: No user found in token" });
    }
    const username = req.decoded.user;
    connection.query("SELECT * FROM user WHERE Username = ?", [username], (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = results[0]; 
        res.status(200).json({
            username: user.Username,
            profileImageUrl: user.User_Image
        });
    });
});

/* --------------------------*/
// Run Server 
app.listen(process.env.PORT, function () {
    console.log(`Server-back is running on port: ${process.env.PORT}`);
});