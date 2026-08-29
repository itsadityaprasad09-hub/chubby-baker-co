import json, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase.pdfmetrics import registerFont
from reportlab.pdfbase.ttfonts import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "menu.json")
LOGO = os.path.join(ROOT, "assets", "logo.png")
OUT = os.path.join(ROOT, "assets", "menu.pdf")

COCOA = HexColor("#3B2418")
COCOA_SOFT = HexColor("#5C3A28")
BERRY = HexColor("#A63F53")
TAN = HexColor("#C9A97B")
CREAM = HexColor("#FBF1E1")

with open(DATA, "r", encoding="utf-8") as f:
    menu = json.load(f)

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=22 * mm, rightMargin=22 * mm,
    topMargin=16 * mm, bottomMargin=16 * mm,
)

story = []

title_style = ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=26, leading=30, textColor=COCOA, alignment=TA_CENTER, spaceAfter=4)
sub_style = ParagraphStyle("sub", fontName="Helvetica-Oblique", fontSize=11, leading=14, textColor=BERRY, alignment=TA_CENTER, spaceAfter=6)
meta_style = ParagraphStyle("meta", fontName="Helvetica", fontSize=9, leading=13, textColor=COCOA_SOFT, alignment=TA_CENTER, spaceAfter=16)
cat_style = ParagraphStyle("cat", fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=COCOA, spaceBefore=16, spaceAfter=6)
name_style = ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=COCOA)
qty_style = ParagraphStyle("qty", fontName="Helvetica", fontSize=8.5, leading=11, textColor=COCOA_SOFT)
price_style = ParagraphStyle("price", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=BERRY, alignment=TA_RIGHT)

if os.path.exists(LOGO):
    story.append(Image(LOGO, width=26 * mm, height=26 * mm, hAlign="CENTER"))
    story.append(Spacer(1, 10))

story.append(Paragraph("Chubby Baker &amp; Co", title_style))
story.append(Paragraph("The Celebration Kitchen", sub_style))
story.append(Paragraph("Bandra West, Mumbai &nbsp;&middot;&nbsp; All prices in Rs. &nbsp;&middot;&nbsp; Order on WhatsApp: +91 91670 72309", meta_style))

for cat in menu:
    story.append(Paragraph(cat["category"], cat_style))
    rows = []
    for item in cat["items"]:
        name_html = item["name"]
        if item.get("qty"):
            name_html += "<br/><font color='#5C3A28' size='8.5'>" + item["qty"] + "</font>"
        rows.append([
            Paragraph(name_html, name_style),
            Paragraph("Rs. " + str(item["price"]), price_style),
        ])
    t = Table(rows, colWidths=[130 * mm, 30 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, TAN),
    ]))
    story.append(t)

story.append(Spacer(1, 20))
story.append(Paragraph("Every order is made fresh after you reach out to us \u2014 no walk-in counter, no shortcuts.", meta_style))

doc.build(story)
print("PDF written to", OUT)
