<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body>
	<table border="0" width="100%">
		<tr>
			<td width="100">
				<img class="image-client" height="77" src="${urlWeb}/images/logo-mills.png"/>
			</td>
		</tr>
		<tr>
			<td colspan="2">
				<br/>
				<p>
					Estimado ${escape.escapeHtml(user.name)}
				</p>
				
				<br/>
				<p>
					Usuario: ${escape.escapeHtml(user.login)}
				</p>
				<p>
					Su nueva clave es: <span style="border: 1px solid gray">${result}</span>
				</p>
			</td>
		</tr>
	</table>
</body>
</html>