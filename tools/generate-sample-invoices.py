"""Rebuild the demo's explicitly non-payable invoice PDFs from billing.json."""
import json
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4

root = Path(__file__).resolve().parents[1]
data = json.loads((root / "src/demo/data/billing.json").read_text(encoding="utf-8"))
output = root / "public/invoices"
output.mkdir(parents=True, exist_ok=True)

for invoice in data["invoices"]:
    path = output / Path(invoice["file"]).name
    pdf = canvas.Canvas(str(path), pagesize=A4, invariant=1)
    width, height = A4
    left, right = 48, width - 48
    pdf.setTitle(f"{invoice['id']} - sample invoice")
    pdf.setAuthor("Forma demo")

    def text(x, y, value, size=11, bold=False, color="#202126"):
        pdf.setFillColor(HexColor(color))
        pdf.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        pdf.drawString(x, height - y, value)

    def rule(y):
        pdf.setStrokeColor(HexColor("#E1E3E8"))
        pdf.setLineWidth(0.75)
        pdf.line(left, height - y, right, height - y)

    text(left, 67, "forma.", 26, True)
    text(left, 121, "Sample invoice", 23, True)
    text(left, 147, "Demonstration only. No payment is due.", 11, color="#656975")
    rule(170)
    text(left, 205, "BILLED TO", 9, True, "#656975")
    text(left, 226, invoice["customer"], 12, True)
    text(left, 247, "Demo workspace", 10, color="#656975")
    text(350, 205, invoice["id"], 12, True)
    text(350, 226, f"Issued {invoice['date']}")
    text(350, 247, f"Status: {invoice['status']} (sample)")
    rule(282)
    text(left, 307, "DESCRIPTION", 9, True, "#656975")
    text(320, 307, "MEMBERS", 9, True, "#656975")
    text(422, 307, "AMOUNT (USD)", 9, True, "#656975")
    text(left, 341, invoice["description"])
    text(left, 362, f"USD {invoice['unitAmount']:.2f} per member", 10, color="#656975")
    text(340, 341, str(invoice["members"]))
    amount = invoice["members"] * invoice["unitAmount"]
    text(442, 341, f"{amount:.2f}")
    rule(391)
    text(left, 430, "Sample total", 13, True)
    text(421, 430, f"USD {amount:.2f}", 13, True)
    text(left, 482, "This file demonstrates invoice downloads in the Forma template.", 10, color="#656975")
    text(left, 501, "It is not a tax invoice or evidence of a payment or subscription.", 10, color="#656975")
    rule(754)
    text(left, 780, "FORMA DEMO  /  SAMPLE DOCUMENT", 9, True, "#656975")
    pdf.save()
    print(path.relative_to(root))
