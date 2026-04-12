const fs = require('fs');

try {
    let text = fs.readFileSync('school-student-clear.html', 'utf8');

    // 1. 비밀번호 초기화 폼 레이아웃 개선
    const pwdRegex = /<td align="left">\s*<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">\s*<select name="clear_grade" id="clear_grade"[\s\S]+?<\/td>/;
    const pwdReplace = `<td align="left">
				<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-start;">
					<select name="clear_grade" id="clear_grade" class="form-control input-sm PAD0" style="width: 130px; flex-shrink: 0;">
						<option value="">=학년전체=</option>
						<option value="1">1학년</option>
						<option value="2">2학년</option>
						<option value="3">3학년</option>
						<option value="4">4학년</option>
						<option value="5">5학년</option>
						<option value="6">6학년</option>
					</select>			
					<input id="def_passwd" name="def_passwd" type="password" value="" maxlength="15" class="form-control input-sm" style="flex: 0 0 180px; min-width: 180px;" placeholder="임시 비밀번호 입력">
					<span style="font-size: 11px; color: #888; flex-shrink: 0;">(4~15자 영문/숫자)</span>
					<a href="#none;" onclick="fm_clear_check('stuPass'); return false;" class="delete_btn" style="margin-left: 20px; flex-shrink: 0; padding: 4px 12px; display: inline-block; background: #eef2f6; border: 1px solid #cdd5df; border-radius: 4px; color: #333; text-decoration: none;"><i class="fa fa-refresh" style="color:#2f7bc1; margin-right:4px;"></i>비밀번호 초기화</a>
				</div>
				<div style="margin-top: 10px; text-align: left;">
					<span class="text-danger" style="font-size: 12px;"><i class="fa fa-info-circle"></i> 입력한 임시 비밀번호로 선택된 학년 전체 학생들의 비밀번호를 초기화합니다.</span>
				</div>
			</td>`;

    // 2. 학생 데이터 삭제 폼
    const studentRegex = /<td align="left">\s*<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">\s*<select name="del_grade" id="del_grade"[\s\S]+?<\/td>/;
    const studentReplace = `<td align="left">
				<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-start;">
					<select name="del_grade" id="del_grade" class="form-control input-sm PAD0" style="width: 130px; flex-shrink: 0;">
						<option value="">=학년전체=</option>
						<option value="1">1학년</option>
						<option value="2">2학년</option>
						<option value="3">3학년</option>
						<option value="4">4학년</option>
						<option value="5">5학년</option>
						<option value="6">6학년</option>
					</select>
					<a href="#none;" onclick="fm_clear_check('student'); return false;" class="delete_btn" style="margin-left: 20px; flex-shrink: 0; padding: 4px 12px; display: inline-block; background: #fff5f5; border: 1px solid #e3b4b4; border-radius: 4px; color: #b73e3e; text-decoration: none;"><i class="fa fa-trash-o" style="color:#d9534f; margin-right:4px;"></i>학생 삭제하기</a>
				</div>
				<div style="margin-top: 10px; text-align: left;">
					<span class="text-danger" style="font-size: 12px;"><i class="fa fa-exclamation-triangle"></i> 주의: 선택된 학년의 학생 데이터를 완전히 삭제합니다. 이 작업은 복구할 수 없습니다.</span>
				</div>
			</td>`;

    // 3. 학생 학과 데이터 초기화 폼
    const courseRegex = /<th>학생 학과 데이터<\/th>\s*<td align="left">\s*<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">[\s\S]+?<\/td>/;
    const courseReplace = `<th>학생 학과 데이터</th>
			<td align="left">
				<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-start;">
					<span style="font-size: 13px; color: #333; font-weight: 500;">전체 학생의 학과 데이터를 초기화합니다.</span>
					<a href="#none;" onclick="fm_clear_check('course'); return false;" class="delete_btn" style="margin-left: 20px; flex-shrink: 0; padding: 4px 12px; display: inline-block; background: #eef2f6; border: 1px solid #cdd5df; border-radius: 4px; color: #333; text-decoration: none;"><i class="fa fa-refresh" style="color:#2f7bc1; margin-right:4px;"></i>학과 데이터 초기화</a>
				</div>
				<div style="margin-top: 10px; text-align: left;">
					<span class="text-danger" style="font-size: 12px;"><i class="fa fa-info-circle"></i> 학과를 사용하고 싶지 않을 때 기존에 등록된 데이터를 일괄 비웁니다.</span>
				</div>
			</td>`;

    if (pwdRegex.test(text)) text = text.replace(pwdRegex, pwdReplace);
    if (studentRegex.test(text)) text = text.replace(studentRegex, studentReplace);
    if (courseRegex.test(text)) text = text.replace(courseRegex, courseReplace);

    fs.writeFileSync('school-student-clear.html', text, 'utf8');
    console.log('Success! Refactored school-student-clear.html table layouts for perfect alignment and size.');
} catch (error) {
    console.error(`Error: ${error.message}`);
}
