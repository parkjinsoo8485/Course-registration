const fs = require('fs');

try {
    let text = fs.readFileSync('school-student-clear.html', 'utf8');

    // 1번: 비밀번호 초기화 구간
    const pwdRegex = /<td align="left">\s*<select name="clear_grade" id="clear_grade" class="form-control input-sm PAD0">[\s\S]+?<\/td>/;
    const pwdReplace = `<td align="left">
				<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<select name="clear_grade" id="clear_grade" class="form-control input-sm PAD0" style="width: 150px; display: inline-block;">
						<option value="">=학년전체=</option>
						<option value="1">1학년</option>
						<option value="2">2학년</option>
						<option value="3">3학년</option>
						<option value="4">4학년</option>
						<option value="5">5학년</option>
						<option value="6">6학년</option>
					</select>			
					<input id="def_passwd" name="def_passwd" type="password" value="" maxlength="15" class="form-control input-sm" style="width:200px; display: inline-block;" placeholder="임시 비밀번호 입력">
					<span style="font-size: 11px; color: #888;">(4~15자 영문/숫자)</span>
					<a href="#none;" onclick="fm_clear_check('stuPass'); return false;" class="delete_btn" style="margin-left: auto;"><i class="fa fa-trash"></i>비밀번호 초기화</a>
				</div>
				<p class="text-danger" style="margin-top:8px; margin-bottom:0; font-size: 11px;"><i class="fa fa-info-circle"></i> 입력한 임시 비밀번호로 학생들의 비밀번호를 초기화합니다.</p>
			</td>`;
            
    // 2번: 학생 데이터 삭제 구간
    const studentRegex = /<td align="left">\s*<select name="del_grade" id="del_grade" class="form-control input-sm PAD0">[\s\S]+?<\/td>/;
    const studentReplace = `<td align="left">
				<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<select name="del_grade" id="del_grade" class="form-control input-sm PAD0" style="width: 150px; display: inline-block;">
						<option value="">=학년전체=</option>
						<option value="1">1학년</option>
						<option value="2">2학년</option>
						<option value="3">3학년</option>
						<option value="4">4학년</option>
						<option value="5">5학년</option>
						<option value="6">6학년</option>
					</select>
					<a href="#none;" onclick="fm_clear_check('student'); return false;" class="delete_btn" style="margin-left: auto;"><i class="fa fa-trash"></i>학생 삭제하기</a>
				</div>
				<p class="text-danger" style="margin-top:8px; margin-bottom:0; font-size: 11px;"><i class="fa fa-info-circle"></i> 선택된 학년의 학생 데이터를 완전히 삭제합니다.</p>
			</td>`;

    // 3번: 학생 학과 데이터 초기화 구간
    const courseRegex = /<th>학생 학과 데이터<\/th>\s*<td align="left">\s*<a href="#none;" onclick="fm_clear_check\('course'\);[\s\S]+?<\/td>/;
    const courseReplace = `<th>학생 학과 데이터</th>
			<td align="left">
				<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<span style="font-size: 12px; color: #444;">전체 학생의 학과 데이터를 초기화합니다.</span>
					<a href="#none;" onclick="fm_clear_check('course'); return false;" class="delete_btn" style="margin-left: auto;"><i class="fa fa-trash"></i>학과 데이터 초기화</a>
				</div>
				<p class="text-danger" style="margin-top:8px; margin-bottom:0; font-size: 11px;"><i class="fa fa-info-circle"></i> 학과를 사용하고 싶지 않을 때 기존에 등록된 데이터를 일괄 비웁니다.</p>
			</td>`;

    if (pwdRegex.test(text)) text = text.replace(pwdRegex, pwdReplace);
    if (studentRegex.test(text)) text = text.replace(studentRegex, studentReplace);
    if (courseRegex.test(text)) text = text.replace(courseRegex, courseReplace);

    fs.writeFileSync('school-student-clear.html', text, 'utf8');
    console.log('Success! Refactored school-student-clear.html table layouts using Flexbox.');
} catch (error) {
    console.error(`Error: ${error.message}`);
}
