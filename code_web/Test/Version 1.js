// JavaScript 

// // Cài đặt chung
// const SS_ID = "1hK8mbj_hT5Luz3AbzHK1LB9q6Se1WUVlo_MImwtA-HU"; // *** VẪN LÀ ID FILE SHEET CỦA ÔNG NHÉ ***
// const ss = SpreadsheetApp.openById(SS_ID);

// // Hàm này không đổi, vẫn để hiển thị web app
// function doGet(e) {
//   return HtmlService.createTemplateFromFile('Index')
//     .evaluate()
//     .setTitle('Form Kiểm kho Mixing/IM')
//     .addMetaTag('viewport', 'width=device-width, initial-scale=1');
// }

// // Lấy thêm danh sách dữ liệu mới từ Master_Data
// function getDropdownData() {
//   const masterSheet = ss.getSheetByName('Master_Data');
//   const data = {
//     may: masterSheet.getRange('A2:A').getValues().flat().filter(String),
//     bundle: masterSheet.getRange('B2:B').getValues().flat().filter(String),
//     nhua1: masterSheet.getRange('C2:C').getValues().flat().filter(String),
//     nhua2: masterSheet.getRange('D2:D').getValues().flat().filter(String),
//     mau: masterSheet.getRange('E2:E').getValues().flat().filter(String),
//     // Thêm các danh sách mới
//     maNhuaHIM: masterSheet.getRange('F2:F').getValues().flat().filter(String),
//     mauBundle: masterSheet.getRange('G2:G').getValues().flat().filter(String),
//     cumEngel: masterSheet.getRange('H2:H').getValues().flat().filter(String),
//     bundleEngel: masterSheet.getRange('I2:I').getValues().flat().filter(String)
//   };
//   return data;
// }

// // *** HÀM LƯU DỮ LIỆU ĐÃ ĐƯỢC NÂNG CẤP ***
// function saveData(formData) {
//   try {
//     const userEmail = Session.getActiveUser().getEmail(); // Tự động lấy email người nhập
//     const timestamp = new Date();
//     let sheetName = "";
//     let newRow = [];

//     // Dùng switch case để xử lý từng nhánh riêng biệt
//     switch (formData.nhanh) {
//       case "Thùng Motan Vim":
//         sheetName = "Data_Motan_Vim";
//         newRow = [
//           timestamp,
//           userEmail,
//           formData.mayMotan,
//           formData.maHatMauMotan,
//           formData.klHatMauMotan
//         ];
//         break;

//       case "Tank máy HIM khu vực IM":
//         sheetName = "Data_Tank_HIM";
//         newRow = [
//           timestamp,
//           userEmail,
//           formData.tenMayTankHim,
//           formData.tenBundleTankHim,
//           formData.maNhuaTankHim,
//           formData.maSoTankHim,
//           formData.khoiLuongTankHim,
//           formData.khoiLuongHopperHim,
//           formData.maMauTankHim,
//           formData.khoiLuongMotanHim
//         ];
//         break;

//       case "Tank máy VIM khu vực IM":
//         sheetName = "Data_Tank_VIM";
//         newRow = [
//           timestamp,
//           userEmail,
//           formData.tenMayTankVim,
//           formData.tenBundleTankVim,
//           formData.mauBundleTankVim,
//           formData.maSoTankVim,
//           formData.khoiLuongTankVim,
//           formData.khoiLuongHopperVim,
//           formData.soLuongCan
//         ];
//         break;

//       case "Nhựa phát ở khu vực IM":
//         sheetName = "Data_Nhua_Phat";
//         newRow = [
//           timestamp,
//           userEmail,
//           formData.mayNhuaPhat,
//           formData.maNhuaPhat,
//           formData.soBaoNhuaPhat
//         ];
//         break;



//       case "Nhựa xả, runner":
//         sheetName = "Data_Nhua_Xa_Runner";
//         newRow = [
//           timestamp,
//           userEmail,
//           formData.tenBundleRunner,
//           formData.xeTrolleyRunner,
//           formData.thungWipRunner,
//           formData.maNhua1Runner,
//           formData.maNhua2Runner,
//           formData.maMauRunner,
//           formData.khoiLuongRunner,
//           formData.thongTinRunner

//         ];
//         break;

//       case "Nhựa Recycle":
//         sheetName = "Data_Nhua_Recycle";
//         newRow = [
//           timestamp,
//           userEmail,
//           formData.tenMay,
//           formData.tenBundle,
//           formData.maNhua1,
//           formData.maNhua2,
//           formData.maMau,
//           formData.khoiLuong
//         ];
//         break;

//       case "Cụm máy ENGEL":
//         sheetName = "Data_Cum_May_ENGEL";
//         newRow = [
//           timestamp,
//           userEmail,
//           formData.tenMayEngel,
//           formData.tenBundleEngel,
//           formData.maNhua1Engel,
//           formData.maNhua2Engel,
//           formData.maMauEngel,
//           formData.khoiLuongEngel
//         ];
//         break;


//       case "Other":
//         sheetName = "Data_Other";
//         newRow = [
//           timestamp,
//           userEmail,
//           formData.tenMayOther,
//           formData.tenBundleOther,
//           formData.maNhua1Other,
//           formData.maNhua2Other,
//           formData.maMauOther,
//           formData.khoiLuongOther,
//           formData.thonTinOther

//         ];
//         break;
      
//       // *** ÔNG THÊM CÁC CASE KHÁC CHO CÁC NHÁNH CÒN LẠI Ở ĐÂY NHÉ ***
//       // case "Tên nhánh khác":
//       //   sheetName = "Tên sheet tương ứng";
//       //   newRow = [ ...dữ liệu tương ứng... ];
//       //   break;

//       default:
//         // Mặc định cho các nhánh chưa làm, hoặc nhánh Other
//         sheetName = "Data_Other";
//         newRow = [timestamp, userEmail, formData.nhanh, JSON.stringify(formData)]; // Lưu tạm dạng text
//         break;
//     }

//     if (!sheetName) {
//       throw new Error("Không xác định được nhánh dữ liệu!");
//     }

//     const sheet = ss.getSheetByName(sheetName);
//     sheet.appendRow(newRow);

//     return { success: true, message: "Lưu dữ liệu thành công!" };
//   } catch (error) {
//     // Ghi log lỗi để dễ debug
//     console.error("Lỗi saveData:", error);
//     return { success: false, message: "Lỗi phía máy chủ: " + error.message };
//   }
// }








/////------------------------------------version 1----------------------------------/////



// -------- HTML ------



// <!DOCTYPE html>
// <html>
// <head>
//   <base target="_top">
 

//   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css" />
//   <script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
// <style>
// /* =================================================================== */
// /* === PHIÊN BẢN CSS CUỐI CÙNG - SẠCH SẼ, GỌN GÀNG === */
// /* =================================================================== */

// /* --- 1. CÀI ĐẶT CHUNG --- */
// body { 
//     font-family: Arial, sans-serif; 
//     background-color: #f4f4f9; 
//     color: #333; 
//     margin: 0; 
//     padding: 20px; 
//     display: flex; 
//     justify-content: center; 
// }
// .container { 
//     width: 100%; 
//     max-width: 600px; 
//     background-color: #ffffff; 
//     padding: 30px; 
//     border-radius: 8px; 
//     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
// }
// h1 { 
//     color: #D93025; 
//     text-align: center; 
//     margin-bottom: 25px; 
// }

// /* --- 2. BỐ CỤC FORM --- */
// .form-row {
//     /* display: flex; */
//     display: grid; /* Đổi từ flex sang grid */
//     grid-template-columns: repeat(3, 1fr); /* Tạo ra một lưới có 3 cột bằng nhau */
//     gap: 20px;
//     margin-bottom: 20px;
// }
// .form-row .form-group {
//     /* flex: 1; */
//     margin-bottom: 0;
//     /* min-width: 0; /* Rất quan trọng để không bị đè nhau */
// }
// .form-group {
//     margin-bottom: 20px;
// }
// .form-group label {
//     font-size: 18px;
//     margin-bottom: 8px;
//     display: block;
//     font-weight: bold;
// }
// label span { 
//     color: #D93025;
// }

// /* --- 3. STYLE CHO CÁC Ô INPUT THƯỜNG --- */
// input[type="text"],
// input[type="number"],
// input[type="email"],
// input[type="date"],
// input[type="time"] {
//     width: 100%;
//     min-height: 50px;
//     padding: 15px;
//     font-size: 16px;
//     border: 1px solid #ccc;
//     border-radius: 8px;
//     box-sizing: border-box;
// }
// ::placeholder {
//     color: #a0aec0;
//     font-style: italic;
// }

// /* --- 4. STYLE CHO CÁC DROPDOWN XỊN (CHOICES.JS) --- */
// /* Style chung cho tất cả dropdown có search */
// .choices {
//     width: 100%;
//     margin: 0;
//     box-sizing: border-box;
// }
// .choices__inner {
//     width: 100%;
//     min-height: 50px !important;
//     padding: 0 15px !important;
//     border-radius: 8px !important;
//     background-color: white !important;
//     border: 1px solid #ccc !important;
//     font-size: 16px !important;
//     display: flex !important;
//     align-items: center !important;
//     box-sizing: border-box !important;
// }
// .choices__inner .choices__item--selectable {
//     font-weight: bold !important;
// }
// .choices__list--dropdown .choices__input {
//     width: 100% !important;
//     background-color: #f7fafc !important;
//     padding: 10px !important;
//     border: 1px solid #ddd !important;
//     border-radius: 4px;
//     margin-bottom: 8px;
// }

// /* --- 5. STYLE "ĐỘ" RIÊNG CHO Ô CHỌN NHÁNH CHÍNH (TO & BỰ)--- */
// #main-branch-group > label {
//     font-size: 22px !important; 
//     text-align: center; 
//     font-weight: 900 !important;
//     color: black;
//     margin-bottom: 15px;
// }
// #main-branch-group .choices__inner {
//     min-height: 75px !important;      /* <<-- MÀY CÓ THỂ TĂNG SỐ NÀY */
//     font-size: 22px !important;       /* <<-- VÀ SỐ NÀY ĐỂ NÓ TO HƠN */
//     font-weight: 500 !important;
//     border-color: #333 !important;
//     border-width: 2px !important;
// }
// /* Style khi ô chọn nhánh chính được chọn */
// #main-branch-group .choices.is-selected .choices__inner {
//     background-color: #fff8f7 !important;
//     border-color: #D93025 !important;
// }

// /* --- 6. CÁC STYLE PHỤ KHÁC --- */
// #submitBtn {
//     width: 100%;
//     min-height: 50px;
//     padding: 15px;
//     border: none;
//     border-radius: 8px;
//     color: white;
//     font-size: 16px;
//     font-weight: bold;
//     cursor: pointer;
//     transition: background-color 0.3s ease;
//     margin-top: 10px;
// }
// #submitBtn:disabled { background-color: #cccccc; cursor: not-allowed; }
// #submitBtn:enabled { background-color: #28a745; }
// #submitBtn:hover:enabled { background-color: #218838; }

// .section-divider { border-top: 2px solid #e2e8f0; margin: 30px 0; }
// .detail-form-section { display: none; }
// #status { text-align: center; margin-top: 15px; font-weight: bold; min-height: 20px;}
// .success { color: #28a745; }
// .error { color: #D93025; }
// .loading { color: #007bff; }
// .form-note { font-style: italic; color: #666; margin-bottom: 15px; border-left: 3px solid #007bff; padding-left: 10px; }
// /* === STYLE CHO CHỮ TRỢ GIÚP BÊN DƯỚI Ô INPUT === */
// .form-helper-text {
//   font-size: 10px; /* Cỡ chữ nhỏ */
//   color: #666; /* Màu xám */
//   font-style: italic; /* In nghiêng */
//   margin-top: 8px; /* Khoảng cách với ô input ở trên */
//   margin-bottom: 0;
//   line-height: 1.4; /* Giãn dòng một chút cho dễ đọc */
// }

// </style>  



// </head>
// <body>
//   <div class="container">
//     <h1>Form Kiểm kho Mixing/IM</h1>
//     <form id="mainForm" novalidate >
//       <div class="form-group" id="main-branch-group">
//         <label for="nhanh">Thông tin nhập thêm là gì? <span>*</span></label>
//         <select id="nhanh" name="nhanh" required>
//           <option value="" disabled selected>-- Chọn một nhánh --</option>
//           <option value="Thùng Motan Vim">Thùng Motan Vim</option>
//           <option value="Tank máy HIM khu vực IM">Tank máy HIM khu vực IM</option>
//           <option value="Tank máy VIM khu vực IM">Tank máy VIM khu vực IM</option>
//           <option value="Nhựa phát ở khu vực IM">Nhựa phát ở khu vực IM</option>
//           <option value="Nhựa xả, runner">Nhựa xả, runner</option>
//           <option value="Nhựa Recycle">Nhựa Recycle</option>
//           <option value="Cụm máy ENGEL">Cụm máy ENGEL</option>
//           <option value="Other">Other</option>
//         </select>
//       </div>
        
//         <hr class="section-divider">
//         <p class="form-note">Ghi chú: Nếu trường hợp không có giá trị, vui lòng chọn "Không".</p>
//         <br>
// <!-- Các nhánh chính -->
//       <!-- Motan thùng VIM -->
//       <div id="form-motan-vim" class="detail-form-section">
//         <div class="form-row">
//           <div class="form-group"><label for="mayMotan">Máy <span>*</span></label><select id="mayMotan" name="mayMotan" required></select></div>
//           <div class="form-group"><label for="maHatMauMotan">Mã hạt màu<span>*</span></label><select id="maHatMauMotan" name="maHatMauMotan" required></select></div>
//           <div class="form-group"><label for="klHatMauMotan">Khối lượng(kg) <span>*</span></label><input type="number" id="klHatMauMotan" name="klHatMauMotan" required  Value="40.2"></div>
//         </div>
//       </div>
      
      
//       <!-- Tank máy HIM khu vực IM -->
//       <div id="form-tank-him-im" class="detail-form-section">
//         <div class="form-row">
//         <div class="form-group"><label for="tenMayTankHim">Tên máy <span>*</span></label><select id="tenMayTankHim" name="tenMayTankHim" required></select></div>
//         <div class="form-group"><label for="tenBundleTankHim">Tên Bundle <span>*</span></label><select id="tenBundleTankHim" name="tenBundleTankHim" required></select></div>
//         <div class="form-group"><label for="maNhuaTankHim">Mã nhựa HIM <span>*</span></label><select id="maNhuaTankHim" name="maNhuaTankHim" required></select></div>
//         </div>

//         <div class="form-row">    
//         <div class="form-group"><label for="maSoTankHim">Khối lượng Tank<span>*</span></label>
//           <input type="number" id="maSoTankHim" name="maSoTankHim" required 
//             maxlength="3"
//             pattern="[0-9]{3}"
//             inputmode="numeric"
//             placeholder="Nhập 3 chữ số, ví dụ: 001"
//             ></div>

//         <div class="form-group"><label for="khoiLuongTankHim">Khối lượng Tank<span>*</span></label>
//           <input type="number" id="khoiLuongTankHim" name="khoiLuongTankHim" required placeholder="100.5"></div>
//         <div class="form-group"><label for="khoiLuongHopperHim">Khối lượng Hopper<span>*</span></label>
//           <input type="number" id="khoiLuongHopperHim" name="khoiLuongHopperHim" required value="5.75"></div>
//         </div>  

//         <div class="form-row">
//         <div class="form-group"><label for="maMauTankHim">Mã màu Motan HIM<span>*</span></label><select id="maMauTankHim" name="maMauTankHim" required></select></div>
//         <div class="form-group"><label for="khoiLuongMotanHim">Khối lượng Motan<span>*</span></label>
//           <input type="number" id="khoiLuongMotanHim" name="khoiLuongMotanHim" required value="6.5"></div>
//         </div>
//       </div>
      
//       <!-- Tank máy VIM khu vực IM -->
//       <div id="form-tank-vim-im" class="detail-form-section">
//         <div class="form-row">
//         <div class="form-group"><label for="tenMayTankVim">Tên máy <span>*</span></label><select id="tenMayTankVim" name="tenMayTankVim" required></select></div>
//         <div class="form-group"><label for="tenBundleTankVim">Tên Bundle <span>*</span></label><select id="tenBundleTankVim" name="tenBundleTankVim" required></select></div>
//         <div class="form-group"><label for="mauBundleTankVim">Màu của Bundle <span>*</span></label><select id="mauBundleTankVim" name="mauBundleTankVim" required></select></div>
//         </div>

//         <div class="form-row">    
//         <div class="form-group"><label for="maSoTankVim">Mã số Tank<span>*</span></label>
//           <input type="number" id="maSoTankVim" name="maSoTankVim" required 
//             maxlength="3" pattern="[0-9]{3}" inputmode="numeric"
//             placeholder="Nhập 3 chữ số, ví dụ: 001"
//             ></div>

//         <div class="form-group"><label for="khoiLuongTankVim">Khối lượng Tank<span>*</span></label>
//           <input type="number" id="khoiLuongTankVim" name="khoiLuongTankVim" required placeholder="100.5"></div>
//         <div class="form-group"><label for="khoiLuongHopperVim">Khối lượng Hopper<span>*</span></label>
//           <input type="number" id="khoiLuongHopperVim" name="khoiLuongHopperVim" required value="1.09"></div>
//         </div>  

//         <div class="form-row">
//         <div class="form-group"><label for="soLuongCan">Số lượng cán<span>*</span></label>
//           <input type="number" id="soLuongCan" name="soLuongCan" required value="0"></div>
//         </div>
//       </div>


//       <!-- Nhựa phát -->
//       <div id="form-nhua-phat" class="detail-form-section">
//         <div class="form-row">  
//           <div class="form-group"><label for="mayNhuaPhat">Máy <span>*</span></label><select id="mayNhuaPhat" name="mayNhuaPhat" required></select></div>
//           <div class="form-group"><label for="maNhuaPhat">Mã nhựa <span>*</span></label><select id="maNhuaPhat" name="maNhuaPhat" required></select></div>
//           <div class="form-group"><label for="soBaoNhuaPhat">Số bao <span>*</span></label><input type="number" id="soBaoNhuaPhat" name="soBaoNhuaPhat" required placeholder="10"></div>
//         </div> 
//       </div> 
      
//       <!-- Nhựa xả, runner -->
//       <div id="form-nhua-runner" class="detail-form-section">
//         <div class="form-row">
//           <div class="form-group"><label for="tenBundleRunner">Tên Bundle <span>*</span></label><select id="tenBundleRunner" name="tenBundleRunner" required></select></div>
//           <div class="form-group"><label for="xeTrolleyRunner">Số lượng xe Trolley<span>*</span></label><input type="number" id="xeTrolleyRunner" name="xeTrolleyRunner" required Value="1"></div>
//           <div class="form-group"><label for="thungWipRunner">Số lượng Thùng Wip<span>*</span></label><input type="number" id="thungWipRunner" name="thungWipRunner" required Value="1"></div>
//         </div>
//         <div class="form-row">    
//           <div class="form-group"><label for="maNhua1Runner">Mã nhựa 1 <span>*</span></label><select id="maNhua1Runner" name="maNhua1Runner" required></select></div>
//           <div class="form-group"><label for="maNhua2Runner">Mã nhựa 2 <span>*</span></label><select id="maNhua2Runner" name="maNhua2Runner" required></select></div>
//           <div class="form-group"><label for="maMauRunner">Mã màu <span>*</span></label><select id="maMauRunner" name="maMauRunner" required></select></div>
//         </div>  
//         <div class="form-row">
//           <div class="form-group"><label for="khoiLuongRunner">Khối lượng <span>*</span></label>
//             <input type="number" id="khoiLuongRunner" name="khoiLuongRunner" required placeholder="10.5"></div>
//           <div class="form-group"><label for="thongTinRunner">Thông tin chi tiết<span>*</span></label>
//             <input type="text" id="thongTinRunner" name="thongTinRunner" required placeholder="Ghi rõ thêm thông tin ở đây"></div>
//         </div>
//       </div>

//       <!-- Nhựa recycle -->
//       <div id="form-nhua-recycle" class="detail-form-section">
//         <div class="form-row">
//           <div class="form-group"><label for="tenMay">Tên máy <span>*</span></label><select id="tenMay" name="tenMay" required></select></div>
//           <div class="form-group"><label for="tenBundle">Tên Bundle <span>*</span></label><select id="tenBundle" name="tenBundle" required></select></div>
//           <div>
//           </div>
//         </div>
//         <div class="form-row">    
//           <div class="form-group"><label for="maNhua1">Mã nhựa 1 <span>*</span></label><select id="maNhua1" name="maNhua1" required></select></div>
//           <div class="form-group"><label for="maNhua2">Mã nhựa 2 <span>*</span></label><select id="maNhua2" name="maNhua2" required></select></div>
//           <div class="form-group"><label for="maMau">Mã màu <span>*</span></label><select id="maMau" name="maMau" required></select></div>
//         </div>  
//         <div class="form-row">
//           <div class="form-group"><label for="khoiLuong">Khối lượng <span>*</span></label>
//             <input type="number" id="khoiLuong" name="khoiLuong" required placeholder="10.5"></div>
//         </div>
//       </div>
     
//       <!-- Engel -->
//       <div id="form-cum-may-engel" class="detail-form-section">
//         <div class="form-row">
//           <div class="form-group"><label for="tenMayEngel">Tên máy <span>*</span></label>
//             <select id="tenMayEngel" name="tenMayEngel" required></select></div>
//           <div class="form-group">
//             <label for="tenBundleEngel">Tên Bundle <span>*</span></label><select id="tenBundleEngel" name="tenBundleEngel" required></select></div>
//         </div>
        
//         <div class="form-row">
//           <div class="form-group">
//             <label for="maNhua1Engel">Mã nhựa 1 <span>*</span></label><select id="maNhua1Engel" name="maNhua1Engel" required></select></div>
//           <div class="form-group">
//             <label for="maNhua2Engel">Mã nhựa 2 <span>*</span></label><select id="maNhua2Engel" name="maNhua2Engel" required></select></div>
//           <div class="form-group">
//             <label for="maMauEngel">Mã màu <span>*</span></label><select id="maMauEngel" name="maMauEngel" required></select></div>
//         </div>
          
//         <div class="form-row">
//           <div class="form-group">
//             <label for="khoiLuongEngel">Khối lượng <span>*</span></label>
//          <p class="form-helper-text">
//           - Hopper (8.64)
//         </p>
//          <p class="form-helper-text">
//           - Phểu (11.29)
//         </p>
//          <p class="form-helper-text">
//           - Hopper + Phểu (19.93)
//         </p>
//             <input type="number" id="khoiLuongEngel" name="khoiLuongEngel" required 
//             placeholder="8.64"></div>
        
//         </div>
//       </div>

//       <!-- Other -->
//       <div id="form-other" class="detail-form-section">
//         <div class="form-row">
//           <div class="form-group">
//             <label for="tenMayOther">Tên máy <span>*</span></label><select id="tenMayOther" name="tenMayOther" required></select></div>
//           <div class="form-group">
//             <label for="tenBundleOther">Tên Bundle <span>*</span></label><select id="tenBundleOther" name="tenBundleOther" required></select></div>
//         </div>
        
//         <div class="form-row">
//           <div class="form-group">
//             <label for="maNhua1Other">Mã nhựa 1 <span>*</span></label><select id="maNhua1Other" name="maNhua1Other" required></select></div>
//           <div class="form-group">
//             <label for="maNhua2Other">Mã nhựa 2 <span>*</span></label><select id="maNhua2Other" name="maNhua2Other" required></select></div>
//           <div class="form-group">
//             <label for="maMauOther">Mã màu <span>*</span></label><select id="maMauOther" name="maMauOther" required></select></div>
//         </div>
        
//         <div class="form-row">
//           <div class="form-group">
//             <label for="khoiLuongOther">Khối lượng <span>*</span></label>
//             <input type="number" id="khoiLuongOther" name="khoiLuongOther" required placeholder="10.5"></div>
//           <div class="form-group">
//             <label for="thonTinOther">Thông tin chi tiết <span>*</span></label>
//             <input type="text" id="thonTinOther" name="thonTinOther" required placeholder="Nhựa Testing khuôn"></div>
//         </div>
//       </div>
      
//       <div id="submit-section" style="display: none;">
//         <button type="submit" id="submitBtn" disabled>Gửi thông tin</button>
//         <div id="status"></div>
//       </div>
//     </form>
//   </div>

// <script>
// document.addEventListener('DOMContentLoaded', function() {
//   // Lấy tất cả các element cần thiết
//   const form = document.getElementById('mainForm');
//   const nhanhSelect = document.getElementById('nhanh');
//   const submitSection = document.getElementById('submit-section');
//   const submitBtn = document.getElementById('submitBtn');
//   const statusDiv = document.getElementById('status');
//   const allDetailForms = document.querySelectorAll('.detail-form-section');

//   new Choices(nhanhSelect, {
//     shouldSort: false, // Giữ nguyên thứ tự các nhánh
//     searchEnabled: false // Cái này không cần search, chỉ cần đẹp là chính
//   });


//   let choiceInstances = {};
//   let selectedNhanhValue = ""; // Biến mới để lưu tên nhánh đã chọn

//   // Hàm điền dữ liệu vào dropdown
//   function populateSelect(selectElement, options) {
//     if (!selectElement) return;

//       // Nếu dropdown này đã được nâng cấp, mình phải hủy nó đi trước khi điền dữ liệu mới
//     if (choiceInstances[selectElement.id]) {
//       choiceInstances[selectElement.id].destroy();
//     }

//     selectElement.innerHTML = '<option value="" disabled selected>-- Chọn --</option>';
//     options.forEach(option => {
//       const opt = document.createElement('option');
//       opt.value = option;
//       opt.textContent = option;
//       selectElement.appendChild(opt);
//     });


//       // Kích hoạt Choices.js cho dropdown này
//     const choices = new Choices(selectElement, {
//       searchEnabled: true, // Bật tính năng search
//       itemSelectText: 'Nhấn để chọn', // Chữ hiện ra khi hover
//       shouldSort: false, // Giữ nguyên thứ tự từ Google Sheet
//       searchPlaceholderValue: 'Nhập để tìm kiếm...',
//     });
    
//     // Lưu lại để quản lý
//     choiceInstances[selectElement.id] = choices;
//   }

//   // Lấy dữ liệu dropdown từ backend khi tải trang
//   google.script.run
//     .withSuccessHandler(data => {
//       // Form Other
//       populateSelect(document.getElementById('tenMayOther'), data.may);
//       populateSelect(document.getElementById('tenBundleOther'), data.bundle);
//       populateSelect(document.getElementById('maNhua1Other'), data.nhua1);
//       populateSelect(document.getElementById('maNhua2Other'), data.nhua1);
//       populateSelect(document.getElementById('maMauOther'), data.mau);

//       // Form Engel
//       populateSelect(document.getElementById('tenMayEngel'), data.cumEngel);
//       populateSelect(document.getElementById('tenBundleEngel'), data.bundleEngel);
//       populateSelect(document.getElementById('maNhua1Engel'), data.nhua1);
//       populateSelect(document.getElementById('maNhua2Engel'), data.nhua1);
//       populateSelect(document.getElementById('maMauEngel'), data.mau);
      
//       // Form Nhựa Phát
//       populateSelect(document.getElementById('mayNhuaPhat'), data.may);
//       populateSelect(document.getElementById('maNhuaPhat'), data.nhua1);
//       // Form Nhựa xả, runner
//       // populateSelect(document.getElementById('tenMay'), data.may);
//       populateSelect(document.getElementById('tenBundleRunner'), data.bundle);
//       populateSelect(document.getElementById('maNhua1Runner'), data.nhua1);
//       populateSelect(document.getElementById('maNhua2Runner'), data.nhua1);
//       populateSelect(document.getElementById('maMauRunner'), data.mau);

//       // Form Recycle
//       populateSelect(document.getElementById('tenMay'), data.may);
//       populateSelect(document.getElementById('tenBundle'), data.bundle);
//       populateSelect(document.getElementById('maNhua1'), data.nhua1);
//       populateSelect(document.getElementById('maNhua2'), data.nhua1);
//       populateSelect(document.getElementById('maMau'), data.mau);
//       // Form Tank Vim Im
//       populateSelect(document.getElementById('tenMayTankVim'), data.may);
//       populateSelect(document.getElementById('tenBundleTankVim'), data.bundle);
//       populateSelect(document.getElementById('mauBundleTankVim'), data.mauBundle);
//       populateSelect(document.getElementById('maMauTankVim'), data.mau);
//       // Form Tank Him Im
//       populateSelect(document.getElementById('tenMayTankHim'), data.may);
//       populateSelect(document.getElementById('tenBundleTankHim'), data.bundle);
//       populateSelect(document.getElementById('maNhuaTankHim'), data.maNhuaHIM);
//       populateSelect(document.getElementById('maMauTankHim'), data.mau);
//       // Form Motan Vim
//       populateSelect(document.getElementById('mayMotan'), data.may);
//       populateSelect(document.getElementById('maHatMauMotan'), data.mau);
//     })
//     .getDropdownData();
    
//   // Hàm kiểm tra validation thông minh
//   function validateForm() {
//     let isValid = true;
//     const activeForm = document.querySelector('.detail-form-section[style*="display: block"]');
//     if (activeForm) {
//       const requiredInputs = activeForm.querySelectorAll('[required]');
//       for (const input of requiredInputs) {
//         if (!input.value.trim()) {
//           isValid = false;
//           break;
//         }
//       }
//     } else {
//       isValid = false;
//     }
//     submitBtn.disabled = !isValid;
//   }

//   // BẮT SỰ KIỆN CHÍNH: KHI CHỌN NHÁNH
//   nhanhSelect.addEventListener('change', function() {
//     const selectedValue = this.value;
//     allDetailForms.forEach(f => f.style.display = 'none');
    
//     let targetFormId = '';
//     switch (selectedValue) {
//       case 'Thùng Motan Vim':       targetFormId = 'form-motan-vim'; break;
//       case 'Tank máy HIM khu vực IM':       targetFormId = 'form-tank-him-im'; break;
//       case 'Tank máy VIM khu vực IM':       targetFormId = 'form-tank-vim-im'; break;
//       case 'Nhựa phát ở khu vực IM': targetFormId = 'form-nhua-phat'; break;
//       case 'Nhựa xả, runner':          targetFormId = 'form-nhua-runner'; break;
//       case 'Nhựa Recycle':          targetFormId = 'form-nhua-recycle'; break;
//       case 'Cụm máy ENGEL':          targetFormId = 'form-cum-may-engel'; break;
//       case 'Other':          targetFormId = 'form-other'; break;
//     }

//     if (targetFormId) {
//       document.getElementById(targetFormId).style.display = 'block';
//       submitSection.style.display = 'block';
//             // === DÒNG MỚI 1: Thêm style 'màu đỏ' vào dropdown ===
//       nhanhSelect.classList.add('selected-branch');
//     } else {
//       submitSection.style.display = 'none';
//              // === DÒNG MỚI 2: Xóa style 'màu đỏ' nếu người dùng chọn lại dòng mặc định ===
//       nhanhSelect.classList.remove('selected-branch');
//     }
//     validateForm();
//   });
  
//   // ===================================================================
//   // === DÒNG BỊ THIẾU NẰM ĐÂY NÈ BỒ TÈO!!! ===
//   // Lắng nghe sự kiện input trên toàn bộ form để kích hoạt nút submit
//   form.addEventListener('input', validateForm);
//   // ===================================================================

//   // Xử lý khi bấm nút SUBMIT
//   form.addEventListener('submit', function(e) {
//     e.preventDefault();
//     submitBtn.disabled = true;
//     statusDiv.className = 'loading';
//     statusDiv.textContent = 'Đang gửi dữ liệu...';

//     const formData = {};
//     formData['nhanh'] = nhanhSelect.value;
//     const activeForm = document.querySelector('.detail-form-section[style*="display: block"]');
    
//     if (activeForm) {
//       const inputs = activeForm.querySelectorAll('input, select');
//       inputs.forEach(input => {
//           // Với Choices.js, mình lấy giá trị từ instance của nó sẽ chính xác hơn
//       if (choiceInstances[input.id]) {
//         formData[input.name] = choiceInstances[input.id].getValue(true);
//       } else {
//         formData[input.name] = input.value;
//       }
//       });
//     }

//     console.log("Dữ liệu chuẩn bị gửi đi:", formData);

//     google.script.run
//       .withSuccessHandler(response => {
//         if (response.success) {
//           statusDiv.className = 'success';
//           statusDiv.textContent = response.message + ' Tự động làm mới sau 2 giây.';
//           setTimeout(() => {
//             form.reset();
//              // Reset các dropdown của Choices.js về trạng thái ban đầu
//             Object.values(choiceInstances).forEach(instance => {
//                 if (document.body.contains(instance.element)) { // Kiểm tra xem element còn tồn tại không
//                     instance.clearStore();
//                     instance.clearInput();
//                 }
//             });

//             allDetailForms.forEach(f => f.style.display = 'none');
//             submitSection.style.display = 'none';
//             statusDiv.textContent = '';
//             // === DÒNG MỚI 3: Xóa style 'màu đỏ' sau khi gửi thành công và reset form ===
//             nhanhSelect.classList.remove('selected-branch');
//             validateForm();
//           }, 2000);
//         } else {
//           throw new Error(response.message);
//         }
//       })
//       .withFailureHandler(err => {
//         statusDiv.className = 'error';
//         statusDiv.textContent = 'Lỗi: ' + err.message;
//         submitBtn.disabled = false;
//       })
//       .saveData(formData);
//   });
// });
// </script>
// </body>
// </html>







//  <!-- Lần 1 
  
//   <style>
// /* =================================================================== */
// /* === PHIÊN BẢN CSS HOÀN CHỈNH, ĐÃ DỌN DẸP VÀ SỬA LỖI === */
// /* =================================================================== */

// /* --- 1. CÀI ĐẶT CHUNG & BỐ CỤC CƠ BẢN --- */
// /* // còn sài // Phần này định dạng body và container chính */
// body { 
//     font-family: Arial, sans-serif; 
//     background-color: #f4f4f9; 
//     color: #333; 
//     margin: 0; 
//     padding: 20px; 
//     display: flex; 
//     justify-content: center; 
// }
// .container { 
//     width: 100%; 
//     max-width: 600px; 
//     background-color: #ffffff; 
//     padding: 30px; 
//     border-radius: 8px; 
//     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
// }
// h1 { 
//     color: #D93025; 
//     text-align: center; 
//     margin-bottom: 25px; 
// }

// /* --- 2. BỐ CỤC CÁC TRƯỜNG NHẬP LIỆU (FORM LAYOUT) --- */
// /* // còn sài // Định dạng cho các hàng chứa nhiều cột */
// .form-row {
//     display: flex;
//     gap: 20px;
//     margin-bottom: 20px;
// }
// /* // còn sài // Thiết lập cho từng cột trong hàng */
// .form-row .form-group {
//     flex: 1; /* Cho các cột rộng bằng nhau */
//     margin-bottom: 0;
//     min-width: 0; /* Quan trọng: Cho phép cột co lại khi cần */
// }
// /* // còn sài // Khoảng cách chung giữa các group không nằm trong .form-row */
// .form-group {
//     margin-bottom: 20px;
// }
// /* // còn sài // Style chung cho các nhãn (label) */
// .form-group label {
//     font-size: 18px;
//     margin-bottom: 8px;
//     display: block;
//     font-weight: bold;
// }
// label span { 
//     color: #D93025; /* Dấu sao màu đỏ */
// }

// /* --- 3. STYLE CHUNG CHO TẤT CẢ Ô NHẬP LIỆU --- */
// /* // còn sài // Áp dụng cho các ô input thường */
// input[type="text"],
// input[type="number"],
// input[type="email"],
// input[type="date"],
// input[type="time"] {
//     width: 100%;
//     min-height: 50px;
//     padding: 15px;
//     font-size: 16px;
//     border: 1px solid #ccc;
//     border-radius: 8px;
//     box-sizing: border-box; /* Rất quan trọng! */
// }
// /* // còn sài // Style cho chữ gợi ý (placeholder) */
// ::placeholder {
//     color: #a0aec0;
//     font-style: italic;
// }

// /* --- 4. STYLE CHO THƯ VIỆN DROPDOWN CHOICES.JS (ĐÃ SỬA LỖI) --- */
// /* // còn sài // Ra lệnh cho Choices.js phải nằm gọn trong cột */
// .choices {
//     width: 100%;
//     margin: 0;
//     box-sizing: border-box; /* THÊM DÒNG NÀY ĐỂ FIX LỖI ĐÈ NHAU */
// }
// /* // còn sài // Style cho cái khung dropdown cho đồng bộ với ô input */
// .choices__inner {
//     width: 100%;
//     min-height: 50px !important;
//     padding: 0 15px !important;
//     border-radius: 8px !important;
//     background-color: white !important;
//     border: 1px solid #ccc !important;
//     font-size: 16px !important;
//     display: flex !important;
//     align-items: center !important;
//     box-sizing: border-box !important;
// }
// /* // còn sài // Style khi dropdown được mở ra */
// .is-open .choices__inner {
//     border-color: #D93025 !important;
// }
// /* // còn sài // Style cho chữ đã chọn (in đậm) */
// .choices__inner .choices__item--selectable {
//     font-weight: bold !important;
// }
// /* // còn sài // Style cho ô tìm kiếm bên trong danh sách */
// .choices__list--dropdown .choices__input {
//     width: 100% !important;
//     background-color: #f7fafc !important;
//     padding: 10px !important;
//     border: 1px solid #ddd !important;
//     border-radius: 4px;
//     margin-bottom: 8px;
// }

// /* --- 5. STYLE RIÊNG CHO CÁC THÀNH PHẦN KHÁC --- */
//   /* Thêm class này vào để highlight dropdown đã chọn */
//       .selected-branch {
//         border-color: #D93025 !important; /* Dùng !important để nó ưu tiên đè lên style cũ */
//         border-width: 2px;
//         background-color: #fff8f7; /* Thêm tí màu nền hồng nhạt cho nó nổi */
//         width: 100%;
//       }
// /* // còn sài // Style highlight cho dropdown chọn nhánh chính */
// #nhanh.selected-branch, .choices[data-type*="select-one"]#nhanh .choices__inner {
//     border-color: #D93025 !important;
//     border-width: 2px !important;
//     background-color: #d93025 !important; //#fff8f7
// }
// /* // còn sài // Style cho nút Submit */
// #submitBtn {
//     width: 100%;
//     min-height: 50px;
//     padding: 15px;
//     border: none;
//     border-radius: 8px;
//     color: white;
//     font-size: 16px;
//     font-weight: bold;
//     cursor: pointer;
//     transition: background-color 0.3s ease;
//     margin-top: 10px;
// }
// #submitBtn:disabled {
//     background-color: #cccccc;
//     cursor: not-allowed;
// }
// #submitBtn:enabled {
//     background-color: #28a745;
// }
// #submitBtn:hover:enabled {
//     background-color: #218838;
// }
// /* // còn sài // Các style phụ khác */
// .section-divider { border-top: 2px solid #e2e8f0; margin: 30px 0; }
// .detail-form-section { display: none; }
// #status { text-align: center; margin-top: 15px; font-weight: bold; min-height: 20px;}
// .success { color: #28a745; }
// .error { color: #D93025; }
// .loading { color: #007bff; }
// .form-note { font-style: italic; color: #666; margin-bottom: 15px; border-left: 3px solid #007bff; padding-left: 10px; }


// /* =================================================== */
// /* === STYLE RIÊNG CHO Ô CHỌN NHÁNH CHÍNH (TO, BỰ) === */
// /* =================================================== */

// /* Style cho cái nhãn "Thông tin nhập thêm là gì?" */
// #main-branch-group label {
//   font-size: 22px !important; /* Cỡ chữ to hơn bình thường */
//   text-align: center; /* Căn chữ ra giữa cho nó pro */
//   font-weight: 900 !important; /* Cực đậm cho nổi bật */
//   color: #D93025; /* <-- MÀU CHỮ CỦA NHÃN, THAY Ở ĐÂY */
//   margin-bottom: 25px; /* Tăng khoảng cách với ô chọn */
// }

// /* Style cho chính cái ô dropdown */
// #main-branch-group .choices__inner {
//   font-size: 30px !important;      /* CHO CHỮ BỰ LÊN TRƯỚC TIÊN */
//   font-weight: 500 !important;    /* Chữ dày vừa phải, không quá đậm */
//   height: 40px !important;     /* CHIỀU CAO TỐI THIỂU CỦA HỘP */
//   /* min-height: 75px !important;     CHIỀU CAO TỐI THIỂU CỦA HỘP */

//    /* Các style phụ đi kèm cho đẹp */
//   border-width: 2px !important;
//   border-color: #333 !important;
//   border-radius: 10px !important;
//   display: flex !important;
//   align-items: center !important;
//   box-shadow: 0 2px 5px rgba(0,0,0,0.05);
// }

// /* Style cho chữ bên trong ô dropdown khi đã chọn */
// #main-branch-group .choices__item--selectable {
//   font-size: 18px !important; /* <-- CỠ CHỮ BÊN TRONG, THAY Ở ĐÂY */
//   color: black !important; /* <-- MÀU CHỮ BÊN TRONG, THAY Ở ĐÂY */
//   background-color: #ffffff !important;
//   border-color: #D93025 !important;
// }

// </style> -->




