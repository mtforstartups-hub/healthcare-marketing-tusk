from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
import textwrap,json,base64

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'content/downloads';OUT.mkdir(exist_ok=True,parents=True)
pdfmetrics.registerFont(TTFont('Sans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
PURPLE=HexColor('#330072');INK=HexColor('#21152F');SLATE=HexColor('#685F72');MIST=HexColor('#EAF3F2');IVORY=HexColor('#F4F1EA');LINE=HexColor('#DDD4E5')
W,H=595.28,841.89;M=45
LOGO=ImageReader(str(ROOT/'public/brand/logos/elephant-healthcare-purple.png'))

def text(c,x,y,s,size=10,font='Sans',color=SLATE,width=500,leading=None):
 c.setFillColor(color);c.setFont(font,size);leading=leading or size*1.6
 lines=[]
 for para in s.split('\n'):
  words=para.split();line=''
  for word in words:
   trial=(line+' '+word).strip()
   if pdfmetrics.stringWidth(trial,font,size)>width and line:lines.append(line);line=word
   else:line=trial
  lines.append(line)
 for line in lines:c.drawString(x,y,line);y-=leading
 return y

def header(c,page,total,title):
 c.setFillColor(white);c.rect(0,0,W,H,fill=1,stroke=0)
 c.drawImage(LOGO,M,H-66,width=33,height=30,mask='auto',preserveAspectRatio=True)
 text(c,M+44,H-44,'MARKETING TUSK',8,'Bold',PURPLE)
 text(c,M+44,H-57,'H E A L T H C A R E',5.8,'Sans',PURPLE)
 c.setStrokeColor(LINE);c.line(M,H-84,W-M,H-84)
 text(c,M,41,'Digital Presence. Credibility. Experience.',6.5,color=SLATE)
 text(c,W-M-44,41,f'{page:02d} / {total:02d}',6.5,color=PURPLE,width=60)
 return H-119

def field(c,label,y,height=42):
 text(c,M,y,label,9,'Bold',INK)
 c.setStrokeColor(LINE);c.roundRect(M,y-height-8,W-2*M,height,4,fill=0,stroke=1)
 return y-height-28

def footer_contact(c,y=83):
 text(c,M,y,'Discuss your digital presence with Marketing Tusk Healthcare.',8,'Bold',PURPLE)
 text(c,M,y-16,'Healthcare@marketingtusk.com  |  +91 8920-382016',8)
 c.linkURL('mailto:Healthcare@marketingtusk.com',(M,y-22,M+210,y-9),relative=0)

checks=[('Organization name','Does the public name match the identity your organization has approved?'),('Location','Can visitors find the correct branch address and postal code?'),('Operating details','Are current opening and contact hours clear where applicable?'),('Business contacts','Do the listed phone and email reach the intended administrative team?'),('Service information','Are approved services organized into understandable pages?'),('Professional information','Are practitioner names, roles and qualifications supported by approved sources?'),('Mobile navigation','Can visitors reach important pages and contact routes on a phone?'),('Contact labels','Does each action explain whether it starts an enquiry or confirms a booking?'),('Forms','Are labels, instructions and error messages understandable?'),('Accessibility checks','Have keyboard use, contrast, text reflow and interaction checks been performed?'),('Content ownership','Does someone own important pages and their factual updates?'),('Review dates','Are changes and next review dates recorded?')]
f=OUT/'Clinic_Website_Checklist.pdf';c=canvas.Canvas(str(f),pagesize=(W,H));c.setTitle('Clinic Website Checklist');c.setAuthor('Marketing Tusk Healthcare')
y=header(c,1,3,'Checklist')
text(c,M,y,'FREE WEBSITE PLANNING TOOL',8,'Bold',PURPLE);y-=50
text(c,M,y,'Clinic Website',33,'Bold',PURPLE);text(c,M,y-46,'Checklist',33,'Bold',PURPLE)
text(c,M,y-96,'Review the information and enquiry experience your website presents. Record what you checked, who owns the information and what needs attention.',11,width=470)
c.setFillColor(MIST);c.roundRect(M,230,W-2*M,195,8,fill=1,stroke=0)
text(c,M+24,390,'Make the review useful.',18,'Bold',PURPLE)
text(c,M+24,356,'Use the next two pages to check twelve important details. Mark each item as current, needing attention or not checked. An untested item is not a confirmed failure.',10,width=445)
text(c,M+24,280,'Organization: __________________   Review date: ______________',8.5)
text(c,M+24,255,'Review owner: ______________________________________________',8.5)
text(c,M,187,'Start with details that affect understanding and contact. Confirm disputed facts with the responsible person before making changes.',9,width=480)
footer_contact(c,117);c.showPage()
for page in [2,3]:
 y=header(c,page,3,'Checklist');text(c,M,y,'Information and enquiry review',20,'Bold',PURPLE);y-=28
 text(c,M,y,'Mark one status for each item. Add the page, owner and next action.',8.5);y-=37
 for i,(title,question) in enumerate(checks[(page-2)*6:(page-1)*6],start=(page-2)*6+1):
  text(c,M,y,f'{i:02d}  {title}',10,'Bold',INK);y-=17
  y=text(c,M+20,y,question,8.5,width=480,leading=12)-7
  for dx,label in [(0,'Checked and current'),(155,'Needs attention'),(285,'Not checked')]:
   c.setStrokeColor(LINE);c.rect(M+20+dx,y-1,6,6);text(c,M+31+dx,y,label,7)
  y-=17;text(c,M+20,y,'Page / observation: ________________________________________________',7);y-=15
  text(c,M+20,y,'Owner / next action / date: __________________________________________',7);y-=23
 c.showPage()
c.save()

f=OUT/'Branch_Information_Register.pdf';c=canvas.Canvas(str(f),pagesize=(W,H));c.setTitle('Branch Information Register');c.setAuthor('Marketing Tusk Healthcare')
y=header(c,1,2,'Register');text(c,M,y,'Branch Information',29,'Bold',PURPLE);text(c,M,y-39,'Register',29,'Bold',PURPLE);y-=77
y=text(c,M,y,'Keep one approved record for each location. Use it to compare public details before choosing a correction.',10,width=480)-28
for label,height in [('Branch ID and approved public name',35),('Full address and postal code',47),('Approved business phone and email',35),('Operating hours or appointment contact arrangements',47),('Official website and location-page URL',35),('Fact confirmed by and confirmation date',35)]:y=field(c,label,y,height)
text(c,M,92,'Keep contact and operating information in separate rows where needed. Do not enter patient information.',8,width=480)
c.showPage();y=header(c,2,2,'Register');text(c,M,y,'Public source and update record',23,'Bold',PURPLE);y-=37
text(c,M,y,'Complete one copy for each source or change. Keep unresolved differences visible.',8.5,width=480);y-=35
for label,height in [('Branch ID and field checked',30),('Listing or public source URL',30),('Approved value and value currently shown publicly',52),('Last public check date and responsible update owner',30),('Required correction and current status',52),('Next review date',30)]:y=field(c,label,y,height)
y=text(c,M,y-2,'For a moved or closed location, record the historical context. A submitted correction remains pending until the public display has been checked.',8.5,width=480)
footer_contact(c,105);c.showPage();c.save()

groups=[('Organization and audience',['What organization and locations does the website represent?','Who needs to use it?','What three tasks should the website make easiest?','What needs improvement in the current website or information?']),('Pages and content',['Which pages are required at launch?','Who owns factual service, professional and location information?','Which brand assets, photographs and documents are available with rights to use?','Which content needs professional review before publication?']),('Enquiries and integrations',['What does each form request and who responds?','Is an appointment action a request or a confirmed booking?','Which scheduling, CRM or administrative tools need to connect?','Which information should not be collected in a public form?']),('Delivery and ownership',['What languages, accessibility requirements and device needs apply?','Who approves design, factual copy and integrations?','What tests and acceptance criteria define a completed website?','Who maintains content and technical operation after launch?'])]
f=OUT/'Healthcare_Website_Brief.pdf';c=canvas.Canvas(str(f),pagesize=(W,H));c.setTitle('Healthcare Website Brief');c.setAuthor('Marketing Tusk Healthcare')
for page,(title,questions) in enumerate(groups,1):
 y=header(c,page,4,'Brief');text(c,M,y,'HEALTHCARE WEBSITE BRIEF',8,'Bold',PURPLE);y-=36;text(c,M,y,title,26,'Bold',PURPLE);y-=36
 y=text(c,M,y,'Define scope, approved information and responsibilities before design begins.',9,width=480)-24
 for n,q in enumerate(questions,start=(page-1)*4+1):
  y=text(c,M,y,f'{n:02d}  {q}',9,'Bold',INK,width=480,leading=14)-2
  c.setStrokeColor(LINE);c.roundRect(M,y-61,W-2*M,55,4,stroke=1,fill=0);y-=83
 text(c,M,y-2,'Owner: _______________________    Date: _______________________',8)
 if page==4:
  text(c,M,147,'FINAL CHECK',7.5,'Bold',PURPLE)
  text(c,M,130,'Approved content | Form routes | Genuine assets | Device checks | Launch owners',7.5,width=490)
  text(c,M,108,'Use this brief to compare scopes and agree the next step. It does not replace the project proposal or contract.',8,width=480)
 else:footer_contact(c,109)
 c.showPage()
c.save()
registry={}
for ident,name in [('clinic-website-checklist','Clinic_Website_Checklist.pdf'),('branch-information-register','Branch_Information_Register.pdf'),('healthcare-website-brief','Healthcare_Website_Brief.pdf')]:
 b=(OUT/name).read_bytes();registry[ident]={'filename':name,'bytes':len(b),'data':base64.b64encode(b).decode()}
(ROOT/'content/resource-files.json').write_text(json.dumps(registry))
print('Created three PDF resources and the private download registry.')
