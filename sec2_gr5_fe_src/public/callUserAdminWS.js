const rootURL = "http://localhost:3002"; // URL หลักของ API

export async function callUserAdminWS(method, endpoint, sentData = {}) {
    const token = localStorage.getItem('authToken'); // ดึง token จาก localStorage

    try {
        // กำหนด options พื้นฐานสำหรับการเรียก API
        const options = {
            method: method.toUpperCase(), // แปลง method ให้เป็นตัวพิมพ์ใหญ่ เช่น POST, GET
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // ใช้ token เพื่อยืนยันตัวตน
            },
        };

        // เพิ่ม body เฉพาะกรณีที่ method เป็น POST, PUT, หรือ DELETE
        if (["POST", "PUT", "DELETE"].includes(method.toUpperCase())) {
            options.body = JSON.stringify(sentData); // ใส่ข้อมูลที่ต้องการส่งไปใน body
        }

        // เรียก API พร้อม endpoint และ options ที่กำหนด
        const response = await fetch(`${rootURL}/${endpoint}`, options);

        // ตรวจสอบว่า response สถานะไม่ใช่ 200-299 (เกิดข้อผิดพลาด)
        if (!response.ok) {
            const errorDetails = await response.text(); // ดึงรายละเอียดข้อผิดพลาดจาก response
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`); // โยนข้อผิดพลาด
        }

        // แปลง response เป็น JSON และคืนค่ากลับ
        const data = await response.json();
        return data;

    } catch (error) {
        console.error(`Error in callUserAdminWS:`, error); // แสดงข้อผิดพลาดใน console
        return {
            error: true, // คืนค่าในรูปแบบ error object
            message: error.message || "Unknown error occurred", // ข้อความแจ้งข้อผิดพลาด
        };
    }
}
