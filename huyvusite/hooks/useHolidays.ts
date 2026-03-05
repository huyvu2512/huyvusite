
import { useState, useEffect } from 'react';

export const useHolidays = (year: number) => {
  const [holidays, setHolidays] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Comprehensive list of fixed Vietnamese holidays
    const staticHolidays: {[key: string]: string} = {
        [`${year}-01-01`]: "Tết Dương Lịch",
        [`${year}-02-03`]: "TL ĐCSVN",
        [`${year}-02-14`]: "Lễ Tình Nhân",
        [`${year}-02-27`]: "Thầy thuốc VN",
        [`${year}-03-08`]: "QT Phụ nữ",
        [`${year}-03-14`]: "Valentine Trắng",
        [`${year}-03-26`]: "TL Đoàn",
        [`${year}-04-01`]: "Cá tháng Tư",
        [`${year}-04-30`]: "GP Miền Nam",
        [`${year}-05-01`]: "QT Lao động",
        [`${year}-05-07`]: "CT Điện Biên",
        [`${year}-05-19`]: "Sinh nhật Bác",
        [`${year}-06-01`]: "QT Thiếu nhi",
        [`${year}-06-28`]: "Gia đình VN",
        [`${year}-07-27`]: "TB Liệt sĩ",
        [`${year}-08-19`]: "CM Tháng 8",
        [`${year}-09-02`]: "Quốc khánh",
        [`${year}-10-10`]: "GP Thủ đô",
        [`${year}-10-13`]: "Doanh nhân VN",
        [`${year}-10-20`]: "Phụ nữ VN",
        [`${year}-10-31`]: "Halloween",
        [`${year}-11-19`]: "QT Nam giới",
        [`${year}-11-20`]: "Nhà giáo VN",
        [`${year}-12-22`]: "QĐND Việt Nam",
        [`${year}-12-24`]: "Đêm Giáng Sinh",
        [`${year}-12-25`]: "Giáng Sinh",
    };

    // Add Lunar New Year (Tet) dates
    // These dates vary by year.
    let lunarHolidays: {[key: string]: string} = {};

    if (year === 2024) {
        lunarHolidays = {
            "2024-02-09": "30 Tết (Giao thừa)",
            "2024-02-10": "Mùng 1 Tết (Giáp Thìn)",
            "2024-02-11": "Mùng 2 Tết",
            "2024-02-12": "Mùng 3 Tết",
            "2024-02-13": "Mùng 4 Tết",
            "2024-02-14": "Mùng 5 Tết",
        };
    } else if (year === 2025) {
        lunarHolidays = {
            "2025-01-28": "30 Tết (Giao thừa)",
            "2025-01-29": "Mùng 1 Tết (Ất Tỵ)",
            "2025-01-30": "Mùng 2 Tết",
            "2025-01-31": "Mùng 3 Tết",
            "2025-02-01": "Mùng 4 Tết",
            "2025-02-02": "Mùng 5 Tết",
        };
    } else if (year === 2026) {
        lunarHolidays = {
            "2026-02-16": "30 Tết (Giao thừa)",
            "2026-02-17": "Mùng 1 Tết (Bính Ngọ)",
            "2026-02-18": "Mùng 2 Tết",
            "2026-02-19": "Mùng 3 Tết",
            "2026-02-20": "Mùng 4 Tết",
            "2026-02-21": "Mùng 5 Tết",
        };
    }

    setHolidays({ ...staticHolidays, ...lunarHolidays });

  }, [year]);

  return holidays;
};
