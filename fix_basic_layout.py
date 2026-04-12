import re
import os

path = r'c:\Users\jinso\.\cursor\projects\c-Users-jinso-Downloads-dbdb-clone\Course-registration\cfg-basic.html'
if not os.path.exists(path):
    path = r'c:\Users\jinso\.cursor\projects\c-Users-jinso-Downloads-dbdb-clone\Course-registration\cfg-basic.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace tapMenu links
content = re.sub(r'https://www.dbdbschool.kr/af/ad_cfg/main/sn/2848', './cfg-basic.html', content)
content = re.sub(r'https://www.dbdbschool.kr/af/ad_cfg/tea/sn/2848', './cfg-teacher-auth.html', content)
content = re.sub(r'https://www.dbdbschool.kr/af/ad_cfg/att/sn/2848', './cfg-attend-option.html', content)
content = re.sub(r'https://www.dbdbschool.kr/af/ad_cfg/sms/sn/2848', './cfg-sms-option.html', content)

# 2. Fix Service Manager Alignment (Find the whole block and replace)
service_mgr_pattern = re.compile(r'<tr>\s*<th colspan=\"2\">서비스 관리자</th>.*?</tr>', re.DOTALL)
new_service_mgr = """<tr>
			<th colspan="2">서비스 관리자</th>
			<td>				
				<div style="display: flex; align-items: flex-start; gap: 10px;">
					<div>												
						<select multiple="" id="addAdminList" name="addAdminList" size="4" class="form-control" style="height:86px; min-width:150px; padding: 0;">
							<option value="128295">관리자2</option>
						</select>
						<input type="hidden" id="addAdminNum" name="addAdminNum" value="128295">
					</div>
					<div style="display: flex; flex-direction: column; gap: 8px; padding-top: 5px;">
						<a href="./school-sms-tel.html" onclick="openMemWin(this.href); return false;" class="btn btn-default btn-sm" style="display: flex; align-items: center; justify-content: center; gap: 5px; height: 35px; min-width: 85px;">
							<i class="fa fa-binoculars"></i> 추가
						</a>
						<a href="#none;" onclick="delAddMem(); return false;" class="btn btn-danger btn-sm" style="display: flex; align-items: center; justify-content: center; gap: 5px; height: 35px; min-width: 85px;">
							<i class="fa fa-trash"></i> 삭제
						</a>
					</div>
				</div>
				<div class="ClearBoth MAT5" style="font-size: 11px; color: #888; margin-top: 8px;">(서비스를 관리할 교직원을 지정합니다.)</div>
				<div class="error_msg addAdminNum"></div>
			</td>	
		</tr>"""

content = service_mgr_pattern.sub(new_service_mgr, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Migration completed successfully.")
