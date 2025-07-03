// Cài đặt chung
const SS_ID = "1hK8mbj_hT5Luz3AbzHK1LB9q6Se1WUVlo_MImwtA-HU"; // *** VẪN LÀ ID FILE SHEET CỦA ÔNG NHÉ ***
const ss = SpreadsheetApp.openById(SS_ID);

// Hàm này không đổi, vẫn để hiển thị web app
function doGet(e) {
  return HtmlService.createTemplateFromFile('Form_Stock_Count_IM_MIXING_P2/Index')
    .evaluate()
    .setTitle('Form Kiểm kho Mixing/IM')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Lấy thêm danh sách dữ liệu mới từ Master_Data
function getDropdownData() {
  const masterSheet = ss.getSheetByName('Master_Data');
  const data = {
    may: masterSheet.getRange('A2:A').getValues().flat().filter(String),
    bundle: masterSheet.getRange('B2:B').getValues().flat().filter(String),
    nhua1: masterSheet.getRange('C2:C').getValues().flat().filter(String),
    nhua2: masterSheet.getRange('D2:D').getValues().flat().filter(String),
    mau: masterSheet.getRange('E2:E').getValues().flat().filter(String),
    // Thêm các danh sách mới
    maNhuaHIM: masterSheet.getRange('F2:F').getValues().flat().filter(String),
    mauBundle: masterSheet.getRange('G2:G').getValues().flat().filter(String),
    cumEngel: masterSheet.getRange('H2:H').getValues().flat().filter(String),
    bundleEngel: masterSheet.getRange('I2:I').getValues().flat().filter(String),
    mayMotanList: masterSheet.getRange('J2:J').getValues().flat().filter(String)
  };
  return data;
}

// *** HÀM LƯU DỮ LIỆU ĐÃ ĐƯỢC NÂNG CẤP ***
function saveData(formData) {
  try {
    const userEmail = Session.getActiveUser().getEmail(); // Tự động lấy email người nhập
    const timestamp = new Date();
    let sheetName = "";
    let newRow = [];

    // Dùng switch case để xử lý từng nhánh riêng biệt
    switch (formData.branchKey) {
      case "MotanVim": //"Thùng Motan Vim":
        sheetName = "Data_Motan_Vim";
        newRow = [
          timestamp,
          userEmail,
          formData.mayMotan,
          formData.maHatMauMotan,
          formData.klHatMauMotan
        ];
        break;

      case "TankHIM": //"Tank máy HIM khu vực IM":
        sheetName = "Data_Tank_HIM";
        newRow = [
          timestamp,
          userEmail,
          formData.tenMayTankHim,
          formData.tenBundleTankHim,
          formData.maNhuaTankHim,
          formData.maSoTankHim,
          formData.khoiLuongTankHim,
          formData.khoiLuongHopperHim,
          formData.maMauTankHim,
          formData.khoiLuongMotanHim
        ];
        break;

      case "TankVIM": //"Tank máy VIM khu vực IM":
        sheetName = "Data_Tank_VIM";
        newRow = [
          timestamp,
          userEmail,
          formData.tenMayTankVim,
          formData.tenBundleTankVim,
          formData.mauBundleTankVim,
          formData.maSoTankVim,
          formData.khoiLuongTankVim,
          formData.khoiLuongHopperVim,
          formData.soLuongCan
        ];
        break;

      case "NhuaPhat": //"Nhựa phát ở khu vực IM":
        sheetName = "Data_Nhua_Phat";
        newRow = [
          timestamp,
          userEmail,
          formData.mayNhuaPhat,
          formData.maNhuaPhat,
          formData.soBaoNhuaPhat
        ];
        break;



      case "NhuaRunner": //"Nhựa xả, runner":
        sheetName = "Data_Nhua_Xa_Runner";
        newRow = [
          timestamp,
          userEmail,
          formData.tenBundleRunner,
          formData.xeTrolleyRunner,
          formData.thungWipRunner,
          formData.maNhua1Runner,
          formData.maNhua2Runner,
          formData.maMauRunner,
          formData.khoiLuongRunner,
          formData.thongTinRunner

        ];
        break;

      case "NhuaRecycle": //"Nhựa Recycle":
        sheetName = "Data_Nhua_Recycle";
        newRow = [
          timestamp,
          userEmail,
          formData.tenMay,
          formData.tenBundle,
          formData.maNhua1,
          formData.maNhua2,
          formData.maMau,
          formData.khoiLuong
        ];
        break;

      case "Engel": //"Cụm máy ENGEL":
        sheetName = "Data_Cum_May_ENGEL";
        newRow = [
          timestamp,
          userEmail,
          formData.tenMayEngel,
          formData.tenBundleEngel,
          formData.maNhua1Engel,
          formData.maNhua2Engel,
          formData.maMauEngel,
          formData.khoiLuongEngel
        ];
        break;


      case "Other":
        sheetName = "Data_Other";
        newRow = [
          timestamp,
          userEmail,
          formData.tenMayOther,
          formData.tenBundleOther,
          formData.maNhua1Other,
          formData.maNhua2Other,
          formData.maMauOther,
          formData.khoiLuongOther,
          formData.thonTinOther

        ];
        break;
      
      // *** ÔNG THÊM CÁC CASE KHÁC CHO CÁC NHÁNH CÒN LẠI Ở ĐÂY NHÉ ***
      // case "Tên nhánh khác":
      //   sheetName = "Tên sheet tương ứng";
      //   newRow = [ ...dữ liệu tương ứng... ];
      //   break;

      default:
        // Mặc định cho các nhánh chưa làm, hoặc nhánh Other
        sheetName = "Data_Other";
        newRow = [timestamp, userEmail, formData.nhanh, JSON.stringify(formData)]; // Lưu tạm dạng text
        break;
    }

    if (!sheetName) {
      throw new Error("Không xác định được nhánh dữ liệu!");
    }

    const sheet = ss.getSheetByName(sheetName);
    sheet.appendRow(newRow);

    return { success: true, message: "Lưu dữ liệu thành công!" };
  } catch (error) {
    // Ghi log lỗi để dễ debug
    console.error("Lỗi saveData:", error);
    return { success: false, message: "Lỗi phía máy chủ: " + error.message };
  }
}



//----------------------include script, css file-----------------------//
function inc(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}







// Clear sheet chỉ để lại 10 row

function clear_Data_All_Sheet(){
  
  const tenCacSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets().map(sheet => sheet.getName());
  const sheetData = tenCacSheet.filter(x => x.toString().startsWith('Data_'));
  console.log( sheetData)

}







function keepFirstTenRows() {
  try{

  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var lastRow = sheet.getLastRow();
    
    if (lastRow > 10) {
      sheet.deleteRows(11, lastRow - 10);
    }
  }
  }catch(e){
    console.log('Có lỗi rồi ' + e)
  }
}










/////------------------------------------version 1----------------------------------/////

// // Cài đặt chung
// const SS_ID = "1hK8mbj_hT5Luz3AbzHK1LB9q6Se1WUVlo_MImwtA-HU"; // *** THAY ID FILE SHEET CỦA ÔNG VÀO ĐÂY ***
// const ss = SpreadsheetApp.openById(SS_ID);

// // Hàm này sẽ chạy khi mở web app, nó trả về file HTML để hiển thị
// function doGet(e) {
//   return HtmlService.createTemplateFromFile('Index')
//     .evaluate()
//     .setTitle('Form Kiểm kho Mixing/IM')
//     .addMetaTag('viewport', 'width=device-width, initial-scale=1');
// }

// // Hàm này lấy dữ liệu từ sheet Master_Data để đưa vào các dropdown
// function getDropdownData() {
//   const masterSheet = ss.getSheetByName('Master_Data');
//   const data = {
//     may: masterSheet.getRange('A2:A').getValues().flat().filter(String),
//     bundle: masterSheet.getRange('B2:B').getValues().flat().filter(String),
//     nhua1: masterSheet.getRange('C2:C').getValues().flat().filter(String),
//     nhua2: masterSheet.getRange('D2:D').getValues().flat().filter(String),
//     mau: masterSheet.getRange('E2:E').getValues().flat().filter(String)
//   };
//   return data;
// }

// // Hàm này nhận dữ liệu từ form và lưu vào sheet tương ứng
// function saveData(formData) {
//   try {
//     const sheetMap = {
//       "Thùng Motan Vim": "Data_Motan_Vim",
//       "Tank máy HIM khu vực IM": "Data_Tank_HIM",
//       "Tank máy VIM khu vực IM": "Data_Tank_VIM",
//       "Nhựa phát ở khu vực IM": "Data_Nhua_Phat",
//       "Nhựa xả, runner": "Data_Nhua_Xa_Runner",
//       "Nhựa Recycle": "Data_Nhua_Recycle",
//       "Cụm máy ENGEL": "Data_Cum_May_ENGEL",
//       "Other": "Data_Other"
//     };

//     const sheetName = sheetMap[formData.nhanh];
//     if (!sheetName) {
//       throw new Error("Không tìm thấy nhánh phù hợp!");
//     }

//     const sheet = ss.getSheetByName(sheetName);
//     const timestamp = new Date();

//     // Dữ liệu sẽ được ghi theo thứ tự này
//     const newRow = [
//       timestamp,
//       formData.tenMay,
//       formData.tenBundle,
//       formData.maNhua1,
//       formData.maNhua2,
//       formData.maMau,
//       formData.khoiLuong
//     ];

//     sheet.appendRow(newRow);

//     return { success: true, message: "Lưu dữ liệu thành công!" };
//   } catch (error) {
//     return { success: false, message: "Lỗi: " + error.message };
//   }
// }