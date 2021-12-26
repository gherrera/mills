package com.htg.mills.entities;

public class ErrorResponse {

    public Integer status;
    public String error;

    public ErrorResponse(int status, String error) {
        this.status = status;
        this.error = error;
    }
}
