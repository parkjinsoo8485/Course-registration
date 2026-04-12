import re

path = r'c:\Users\jinso\.\cursor\projects\c-Users-jinso-Downloads-dbdb-clone\Course-registration\cfg-basic.html'.replace('\\.', '')
if not os.path.exists(path):
    import os
    path = r'c:\Users\jinso\.cursor\projects\c-Users-jinso-Downloads-dbdb-clone\Course-registration\cfg-basic.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Service Manager Block
pattern = re.compile(r'<tr>\s*<th colspan=\"2\">서비스 관리자</th>\s*<td>.*?</td>\s*</tr>', re.DOTALL)
replacement = """<tr>
			<th colspan="2">서비스 관리자</th>
			<td style="padding: 15px;">				
				<div style="display: flex; align-items: flex-start; gap: 12px;">
					<div>												
						<select multiple="" id="addAdminList" name="addAdminList" size="4" class="form-control" style="height:90px; min-width:160px; padding: 0;">
							<option value="128295">관리자2</option>
						</select>
						<input type="hidden" id="addAdminNum" name="addAdminNum" value="128295">
					</div>
					<div style="display: flex; flex-direction: column; gap: 10px;">
						<a href="./school-teacher.html" class="btn btn-default btn-sm" style="display: flex; align-items: center; justify-content: center; gap: 5px; height: 38px; min-width: 90px; border: 1px solid #ccc;">
							<i class="fa fa-binoculars"></i> 추가
						</a>
						<a href="#none;" onclick="delAddMem(); return false;" class="btn btn-danger btn-sm" style="display: flex; align-items: center; justify-content: center; gap: 5px; height: 38px; min-width: 90px;">
							<i class="fa fa-trash"></i> 삭제
						</a>
					</div>
				</div>
				<div class="ClearBoth MAT5" style="font-size: 11px; color: #888; margin-top: 10px;">(서비스를 관리할 교직원을 지정합니다.)</div>
				<div class="error_msg addAdminNum"></div>
			</td>	
		</tr>"""

content = pattern.sub(replacement, content)

# Remove all external dbdbschool links to local
content = content.replace('https://www.dbdbschool.kr/af/ad_cfg/tea/sn/2848', './cfg-teacher-auth.html')
content = content.replace('https://www.dbdbschool.kr/af/ad_cfg/att/sn/2848', './cfg-attend-option.html')
content = content.replace('https://www.dbdbschool.kr/af/ad_cfg/sms/sn/2848', './cfg-sms-option.html')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fix applied successfully.")
