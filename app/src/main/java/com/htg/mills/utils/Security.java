package com.htg.mills.utils;

import java.io.UnsupportedEncodingException;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Enumeration;

import org.bouncycastle.util.encoders.Hex;

public class Security {

	//private NetworkInterface network;
	private static MessageDigest md;
	private byte[] mac;
	
	static {
		try {
			md = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
	}
	
	public Security() throws SocketException {
		//InetAddress ip;
		//ip = InetAddress.getLocalHost();

		mac = null;
		Enumeration<NetworkInterface> eth = NetworkInterface.getNetworkInterfaces();
		while (eth.hasMoreElements()) {
			NetworkInterface eth0 = (NetworkInterface) eth.nextElement();
			byte[] m = eth0.getHardwareAddress();
			if(m != null && m.length > 0) {
				mac = m;
				break;
			}
		}
		//network = NetworkInterface.getByInetAddress(ip);
	}
	
	public String getMacAddress() {
		//byte[] mac = network.getHardwareAddress();
		if(mac != null) {
			StringBuilder sb = new StringBuilder();
			for (int i = 0; i < mac.length; i++) {
				sb.append(String.format("%02X%s", mac[i], (i < mac.length - 1) ? "-" : ""));
			}
			return sb.toString();
		}
		return null;
	}

	public static String getSha256Value(String value) {
		if(value != null) {
			try {
				MessageDigest md = MessageDigest.getInstance("SHA-256");
				md.update(value.getBytes("UTF-8"));
				byte[] digest = md.digest();
				return new String(Hex.encode(digest));
			} catch (NoSuchAlgorithmException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return null;
			} catch (UnsupportedEncodingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return null;
			}
			
		}else {
			return null;
		}
	}
	
}
