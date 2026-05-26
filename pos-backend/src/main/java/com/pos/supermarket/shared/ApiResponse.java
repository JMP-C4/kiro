package com.pos.supermarket.shared;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper estándar para todas las respuestas de la API.
 * Formato: { codigo, mensaje, data }
 * Cumple RNF-21: mensajes de error estructurados en JSON.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private String codigo;
    private String mensaje;
    private T data;
    private Object detalles;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .codigo("OK")
                .mensaje("Operación exitosa")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> ok(String mensaje, T data) {
        return ApiResponse.<T>builder()
                .codigo("OK")
                .mensaje(mensaje)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String codigo, String mensaje) {
        return ApiResponse.<T>builder()
                .codigo(codigo)
                .mensaje(mensaje)
                .build();
    }

    public static <T> ApiResponse<T> error(String codigo, String mensaje, Object detalles) {
        return ApiResponse.<T>builder()
                .codigo(codigo)
                .mensaje(mensaje)
                .detalles(detalles)
                .build();
    }
}
