const rootURL = "http://localhost:3002"; // URL หลักสำหรับ API

export async function callProductWS(url, method, productData = null) {
    let data;
    const token = localStorage.getItem('authToken'); // ดึง token จาก localStorage เพื่อใช้ในการยืนยันตัวตน

    const fullURL = new URL(url, rootURL); // สร้าง URL เต็มจาก URL ที่ส่งเข้ามาและ URL หลัก
    console.log(`Calling method: ${method} at ${fullURL}`); // แสดงข้อมูลการเรียก API ใน console

    try {
        let response;
        switch (method) {
            case "getProducts":
                // เรียก API เพื่อดึงข้อมูลสินค้า
                response = await fetch(fullURL, {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json', // กำหนดประเภทของข้อมูลที่ยอมรับ
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`); // ตรวจสอบข้อผิดพลาดของ HTTP
                }

                data = await response.json(); // แปลง response เป็น JSON

                if (data.error) {
                    console.error("Server error:", data.message); // แสดงข้อความข้อผิดพลาดจากเซิร์ฟเวอร์
                    return null;
                }

                if (!data.data || data.data.length === 0) {
                    console.warn("No products found matching search criteria."); // แจ้งเตือนถ้าไม่พบข้อมูลสินค้า
                    return []; 
                }

                console.log(data); // แสดงข้อมูลสินค้าใน console
                break;

            case "getProducts+search":
                // เรียก API พร้อม Authorization เพื่อตรวจสอบสิทธิ์
                response = await fetch(fullURL, {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`, // ใส่ token ใน Header
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                data = await response.json();

                if (data.error) {
                    console.error("Server error:", data.message);
                    return null;
                }

                if (!data.data || data.data.length === 0) {
                    console.warn("No products found matching search criteria.");
                    return [];
                }

                console.log(data);
                break;

            case "insertProduct":
                // เพิ่มสินค้าใหม่ด้วย method POST
                response = await fetch(fullURL, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        "Content-Type": "application/json", // ระบุประเภทข้อมูลที่ส่ง
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(productData), // ส่งข้อมูลสินค้าในรูปแบบ JSON
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                data = await response.json();
                console.log(data); // แสดงผลลัพธ์ใน console
                break;

            case "updateProduct":
                // แก้ไขข้อมูลสินค้าด้วย method PUT
                response = await fetch(fullURL, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ProductID: productData.ProductID, // ระบุ ID ของสินค้า
                        product: productData.product, // ส่งข้อมูลสินค้าใหม่
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                data = await response.json();
                console.log(data);
                break;

            case "deleteProduct":
                // ลบสินค้าด้วย method DELETE
                response = await fetch(fullURL, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ProductID: productData.ProductID, // ระบุ ID ของสินค้าที่ต้องการลบ
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                data = await response.json();
                console.log(data);
                break;

            default:
                throw new Error("Method not supported."); // กรณี method ไม่ถูกต้อง
        }
    } catch (error) {
        console.error("Error in callProductWS:", error.message); // แสดงข้อผิดพลาดใน console
        alert(`Error: ${error.message}`); // แสดงข้อความแจ้งเตือนข้อผิดพลาด
    }
    return data; // คืนค่าข้อมูลที่ได้จาก API
}
