import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, ExternalLink, Bot } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";

export function GeminiAssistant() {
  const { dashboardData } = useApp();
  const [copied, setCopied] = useState(false);

  const handleAskGemini = () => {
    if (!dashboardData) return;
    
    // Build context prompt
    const { totalIncome, totalExpense, expenseByCategory } = dashboardData;
    
    let prompt = `Chào Gemini, tôi cần bạn đóng vai một chuyên gia tư vấn tài chính cá nhân và gia đình. Hãy suy nghĩ thật kỹ (sử dụng khả năng Thinking) để phân tích tình hình chi tiêu tháng này của gia đình tôi và đưa ra lời khuyên thiết thực nhất:\n\n`;
    prompt += `📊 TỔNG QUAN THÁNG NÀY:\n`;
    prompt += `- Tổng thu nhập: ${formatCurrency(totalIncome)}\n`;
    prompt += `- Tổng chi tiêu: ${formatCurrency(totalExpense)}\n`;
    prompt += `- Số dư còn lại: ${formatCurrency(totalIncome - totalExpense)}\n\n`;
    prompt += `🛒 CHI TIẾT CÁC KHOẢN CHI:\n`;
    
    if (expenseByCategory.length === 0) {
      prompt += `(Chưa có dữ liệu chi tiêu nào)\n`;
    } else {
      expenseByCategory.forEach(cat => {
        prompt += `+ ${cat.name}: ${formatCurrency(cat.value)}\n`;
      });
    }
    
    prompt += `\n🎯 CÂU HỎI:\n`;
    prompt += `1. Dựa trên quy tắc 6 chiếc lọ (JARS) và tình hình thực tế trên, bạn thấy cấu trúc chi tiêu của gia đình tôi đã hợp lý chưa?\n`;
    prompt += `2. Khoản chi nào đang có dấu hiệu lãng phí hoặc vượt mức?\n`;
    prompt += `3. Bạn có mẹo thực tế nào để tôi tối ưu chi phí nuôi con và tăng quỹ tiết kiệm/đầu tư cho tháng tới không?`;

    // Copy to clipboard using navigator API
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
      
      // Mở thẻ mới tới Gemini
      window.open("https://gemini.google.com/app", "_blank");
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      // Fallback if copy fails, still open Gemini
      window.open("https://gemini.google.com/app", "_blank");
    });
  };

  return (
    <Card className="mt-6 border-violet-100 dark:border-violet-900 bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 dark:from-slate-900 dark:to-slate-900">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-violet-700 dark:text-violet-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
            <Sparkles className="h-4 w-4" />
          </div>
          Trợ lý Tài chính AI (Gemini)
        </CardTitle>
        <CardDescription>
          Nhận phân tích và lời khuyên chuyên sâu từ siêu trí tuệ Google Gemini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/60 dark:bg-black/20 p-4 rounded-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shadow-inner">
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            Hệ thống sẽ tự động tổng hợp toàn bộ dữ liệu thu chi tháng này của bạn, copy vào bộ nhớ tạm và mở trang Gemini. 
            Bạn chỉ cần bấm phím <strong>Ctrl + V (Dán)</strong> để hỏi chuyên gia!
          </div>
          <Button 
            onClick={handleAskGemini}
            className="w-full sm:w-auto shrink-0 bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 transition-all"
          >
            {copied ? <Copy className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
            {copied ? "Đã copy dữ liệu!" : "Hỏi Gemini ngay"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
