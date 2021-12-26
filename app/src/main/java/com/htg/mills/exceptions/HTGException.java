package com.htg.mills.exceptions;

/**
 * @author German Herrera
 *
 */
public class HTGException extends RuntimeException  {
	public final static byte[] MESSAGE_1 = new byte[]{103, 51, 36, 49, 110, 116, 51, 108};
	public final static byte[] MESSAGE_2 = new byte[]{115, 51, 99, 114, 51, 116, 97};
	/**
	 * 
	 */
	private static final long serialVersionUID = 1235726500880740591L;

	public HTGException(String message) {
		super(message);
	}
	
	public HTGException(String message, Throwable cause) {
		super(message, cause);
	}
}
